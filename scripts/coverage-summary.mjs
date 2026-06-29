#!/usr/bin/env node
/**
 * Reads Vitest json-summary coverage files and writes a markdown table to
 * GITHUB_STEP_SUMMARY (or stdout when run locally).
 */
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const PACKAGES = [
  { label: "contracts", summaryPath: "packages/contracts/coverage/coverage-summary.json" },
  { label: "server", summaryPath: "server/coverage/coverage-summary.json" },
  { label: "client", summaryPath: "client/coverage/coverage-summary.json" },
];

/** Formats a ratio as a percentage string. */
function formatPct(ratio) {
  return `${(ratio * 100).toFixed(1)}%`;
}

/** Reads one Vitest coverage-summary.json file. */
function readSummary(relativePath) {
  const absolutePath = path.join(repoRoot, relativePath);

  if (!existsSync(absolutePath)) {
    return null;
  }

  const parsed = JSON.parse(readFileSync(absolutePath, "utf8"));

  if (typeof parsed !== "object" || parsed === null || !("total" in parsed)) {
    return null;
  }

  const total = parsed.total;

  return {
    lines: total.lines.pct / 100,
    statements: total.statements.pct / 100,
    functions: total.functions.pct / 100,
    branches: total.branches.pct / 100,
  };
}

/** Builds a simple average across packages that produced coverage. */
function aggregateSummaries(summaries) {
  if (summaries.length === 0) {
    return null;
  }

  const keys = ["lines", "statements", "functions", "branches"];
  const totals = Object.fromEntries(keys.map((key) => [key, 0]));

  for (const summary of summaries) {
    for (const key of keys) {
      totals[key] += summary[key];
    }
  }

  const count = summaries.length;

  return Object.fromEntries(keys.map((key) => [key, totals[key] / count]));
}

const rows = [];
const parsedSummaries = [];

for (const pkg of PACKAGES) {
  const summary = readSummary(pkg.summaryPath);

  if (!summary) {
    rows.push(`| ${pkg.label} | — | — | — | — |`);
    continue;
  }

  parsedSummaries.push(summary);
  rows.push(
    `| ${pkg.label} | ${formatPct(summary.lines)} | ${formatPct(summary.statements)} | ${formatPct(summary.functions)} | ${formatPct(summary.branches)} |`,
  );
}

const aggregate = aggregateSummaries(parsedSummaries);

if (aggregate) {
  rows.push(
    `| **overall (avg)** | **${formatPct(aggregate.lines)}** | **${formatPct(aggregate.statements)}** | **${formatPct(aggregate.functions)}** | **${formatPct(aggregate.branches)}** |`,
  );
}

const markdown = [
  "## Code coverage",
  "",
  "| Package | Lines | Statements | Functions | Branches |",
  "| --- | ---: | ---: | ---: | ---: |",
  ...rows,
  "",
].join("\n");

const summaryPath = process.env.GITHUB_STEP_SUMMARY;

if (summaryPath) {
  appendFileSync(summaryPath, `${markdown}\n`);
} else {
  process.stdout.write(`${markdown}\n`);
}
