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
        >
          <defs>
            <linearGradient id="calGradient" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#4f8ef7" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#calGradient)"
            d="M19 4h-2V2h-2v2H9V2H7v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM7 12h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM7 16h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z" 
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
