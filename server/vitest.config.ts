import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contractsSrc = path.resolve(__dirname, "../packages/contracts/src");

export default defineConfig({
  resolve: {
    alias: {
      "@trading-signal/contracts/alert.js": path.join(contractsSrc, "alert.ts"),
      "@trading-signal/contracts/recommendation.js": path.join(contractsSrc, "recommendation.ts"),
      "@trading-signal/contracts/auth.js": path.join(contractsSrc, "auth.ts"),
      "@trading-signal/contracts/parseAlertNotification.js": path.join(
        contractsSrc,
        "parseAlertNotification.ts",
      ),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
