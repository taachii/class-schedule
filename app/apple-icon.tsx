import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0d0f14',
        }}
      >
        <svg 
          width="120" 
          height="120" 
          viewBox="125 15 100 60" 
          fill="none" 
          stroke="url(#sumGradient)" 
          strokeWidth="6" 
          strokeLinecap="butt"
        >
          <defs>
            <linearGradient id="sumGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#ec4899" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path d="M 135 58 V 40 A 18 18 0 0 1 171 40 V 58" />
          <path d="M 171 40 A 18 18 0 0 1 207 40" />
          <path d="M 207 50 V 66 M 199 58 H 215" strokeWidth="4" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
