/** Returns true when value is a non-null object record. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Returns true when an error is a Prisma unique-constraint violation (P2002). */
export function isPrismaUniqueViolation(error: unknown): boolean {
  if (!isRecord(error)) {
    return false;
  }

  return error.code === "P2002";
}
