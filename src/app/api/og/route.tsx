import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { TOOL_REGISTRY } from '@/lib/constants';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const toolId = searchParams.get('tool');

  let title = 'DevShift';
  let subtitle = 'Free Online Developer Converter Tools';
  let description = 'JS to TS, JSON to Zod, CSS to Tailwind & 13+ more tools';

  if (toolId && toolId in TOOL_REGISTRY) {
    const tool = TOOL_REGISTRY[toolId as keyof typeof TOOL_REGISTRY];
    title = tool.name;
    subtitle = 'Free Online Tool';
    description = tool.description;
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px 80px',
          background: '#0c0f14',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Top bar accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #d4a844, #e8c36a, #d4a844)',
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#d4a844',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: 700,
              color: '#0c0f14',
            }}
          >
            D
          </div>
          <span
            style={{
              fontSize: '24px',
              fontWeight: 600,
              color: '#e5e5e5',
              letterSpacing: '-0.02em',
            }}
          >
            DevShift
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: toolId ? '56px' : '48px',
            fontWeight: 700,
            color: '#ffffff',
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '16px',
          }}
        >
          {title}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: 500,
            color: '#d4a844',
            marginBottom: '20px',
          }}
        >
          {subtitle}
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '22px',
            color: '#9ca3af',
            lineHeight: 1.4,
            maxWidth: '800px',
          }}
        >
          {description}
        </div>

        {/* Bottom domain */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '60px',
            fontSize: '20px',
            color: '#6b7280',
          }}
        >
          devshift.dev
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
