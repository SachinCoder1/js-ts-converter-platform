export function looksLikeCSS(input: string): boolean {
  const trimmed = input.trim();
  if (trimmed.length === 0) return false;
  const hasBraces = /\{[\s\S]*\}/.test(trimmed);
  const hasAtRule = /@(media|keyframes|import|charset|font-face|supports|layer)/.test(trimmed);
  const hasProperty = /[\w-]+\s*:\s*[^;]+;/.test(trimmed);
  return hasBraces || hasAtRule || hasProperty;
}
