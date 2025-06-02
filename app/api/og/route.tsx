import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get parameters from URL or use defaults
    const title = searchParams.get('title') || 'Random Name Finder';
    const subtitle = searchParams.get('subtitle') || 'Find the perfect name instantly with AI.';
    const category = searchParams.get('category') || '';
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: 'white',
            padding: '80px',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
          }}
        >
          {/* Logo/Brand in top-left */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Logo placeholder - you can replace with actual SVG */}
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                fontWeight: '700',
              }}
            >
              RN
            </div>
            <span
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1f2937',
              }}
            >
              Random Name Finder
            </span>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              maxWidth: '900px',
              marginTop: '40px',
            }}
          >
            {/* Category tag (if provided) */}
            {category && (
              <div
                style={{
                  backgroundColor: '#eff6ff',
                  color: '#3b82f6',
                  padding: '8px 20px',
                  borderRadius: '20px',
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '24px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                }}
              >
                {category}
              </div>
            )}

            {/* Main title */}
            <h1
              style={{
                fontSize: title.length > 30 ? '64px' : '80px',
                fontWeight: '700',
                color: '#111827',
                lineHeight: '1.1',
                margin: '0 0 24px 0',
                letterSpacing: '-2px',
              }}
            >
              {title}
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '32px',
                fontWeight: '400',
                color: '#6b7280',
                lineHeight: '1.4',
                margin: '0',
                maxWidth: '800px',
              }}
            >
              {subtitle}
            </p>

            {/* Decorative element */}
            <div
              style={{
                width: '120px',
                height: '4px',
                backgroundColor: '#3b82f6',
                borderRadius: '2px',
                marginTop: '32px',
              }}
            />
          </div>

          {/* Background decoration */}
          <div
            style={{
              position: 'absolute',
              right: '-100px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '400px',
              height: '400px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              borderRadius: '50%',
              opacity: 0.3,
            }}
          />
          
          {/* Secondary decoration */}
          <div
            style={{
              position: 'absolute',
              right: '50px',
              bottom: '50px',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '50%',
              opacity: 0.4,
            }}
          />
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    console.log(`Failed to generate OG image: ${errorMessage}`);
    
    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#3b82f6',
            color: 'white',
            fontSize: '48px',
            fontWeight: '700',
          }}
        >
          <div>Random Name Finder</div>
          <div style={{ fontSize: '24px', marginTop: '20px', opacity: 0.8 }}>
            AI-Powered Name Generation
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
} 