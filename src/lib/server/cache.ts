import 'server-only';
import type { ConversionResult, CacheEntry } from '../types';
import { MAX_CACHE_SIZE, CACHE_TTL } from '../constants';

const cache = new Map<string, CacheEntry>();

export async function getFromCache(key: string, prefix: string = 'ts'): Promise<ConversionResult | null> {
  const fullKey = `${prefix}:${key}`;
  const entry = cache.get(fullKey);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(fullKey);
    return null;
  }

  return { ...entry.result, fromCache: true };
}

export async function setCache(key: string, result: ConversionResult, prefix: string = 'ts'): Promise<void> {
  const fullKey = `${prefix}:${key}`;

  if (cache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry (first key in Map iteration order)
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }

  cache.set(fullKey, { result, timestamp: Date.now() });
}
