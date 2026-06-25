/** Suffix appended to Redis keys for long-lived fallback cache entries. */
export const REDIS_BACKUP_KEY_SUFFIX = ":backup";

/** Builds the backup Redis key for a primary cache key. */
export function buildBackupCacheKey(primaryKey: string): string {
  return `${primaryKey}${REDIS_BACKUP_KEY_SUFFIX}`;
}
