import { NextRequest, NextResponse } from 'next/server';
import { getClientIP } from '@/lib/server/request-utils';

// Simple in-memory rate limit for health endpoint: 30 requests/minute per IP
const healthHits = new Map<string, { count: number; reset: number }>();

export async function GET(request: NextRequest) {
  const ip = getClientIP(request);
  const now = Date.now();
  const record = healthHits.get(ip);

  if (record && now < record.reset) {
    record.count++;
    if (record.count > 30) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }
  } else {
    healthHits.set(ip, { count: 1, reset: now + 60_000 });
  }

  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
}
