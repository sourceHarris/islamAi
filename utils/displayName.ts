/** Correct the user's requested spelling for display without changing account identifiers. */
export function displayName(value: unknown): string {
  return typeof value === 'string' ? value.replace(/\bhuzafia\b/gi, 'Huzaifa').trim() : '';
}
