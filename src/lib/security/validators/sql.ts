export function looksLikeSQL(input: string): boolean {
  const trimmed = input.trim().toUpperCase();
  if (trimmed.length === 0) return false;
  const sqlKeywords = ['CREATE TABLE', 'ALTER TABLE', 'CREATE TYPE', 'CREATE INDEX'];
  return sqlKeywords.some(kw => trimmed.includes(kw));
}
