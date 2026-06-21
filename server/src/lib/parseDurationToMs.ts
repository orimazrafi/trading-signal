/** Parses duration strings like 1h, 30m, 7d into milliseconds. */
export function parseDurationToMs(raw: string): number {
  const match = /^(\d+)([smhd])$/.exec(raw.trim());
  if (!match) {
    return 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return 60 * 60 * 1000;
  }
}
