/** Rotates the symbol list so refresh/load-more cycles fetch different company news. */
export function rotateNewsIngestSymbols(
  symbols: readonly string[],
  rotationIndex: number,
): string[] {
  if (symbols.length === 0) {
    return [];
  }

  const normalizedIndex = ((rotationIndex % symbols.length) + symbols.length) % symbols.length;

  return [...symbols.slice(normalizedIndex), ...symbols.slice(0, normalizedIndex)];
}
