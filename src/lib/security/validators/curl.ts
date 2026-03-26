export function looksLikeCurl(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;
  const startsCurl = /^curl\s/i.test(trimmed);
  const hasUrl = /https?:\/\/\S+/.test(trimmed);
  return startsCurl || hasUrl;
}
