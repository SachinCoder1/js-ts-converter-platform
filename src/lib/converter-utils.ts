export function computeStatusText(
  isConverting: boolean,
  result: { duration: number } | null,
  selectedProvider: string
): string {
  if (isConverting) {
    return `Converting via ${selectedProvider === 'auto' ? 'AI' : selectedProvider}...`;
  }
  if (result) {
    return result.duration < 1000
      ? `Converted in ${result.duration}ms`
      : `Converted in ${(result.duration / 1000).toFixed(1)}s`;
  }
  return 'Ready';
}

export function computeStatusState(
  isConverting: boolean,
  result: unknown
): 'idle' | 'active' | 'done' {
  return isConverting ? 'active' : result ? 'done' : 'idle';
}
