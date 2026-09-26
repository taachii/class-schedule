import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
        {/* We use a scaled-up version of the SVG. The original viewBox is 0 15 230 60, meaning width 230, height 45. 
            We center it in the 512x512 box. */}
        <svg 
          width="320" 
          height="320" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="url(#calGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <defs>
            <linearGradient id="calGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f8ef7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
      </div>
    ),
    { ...size }
  );
}
