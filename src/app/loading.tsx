import React from 'react';

export default function Loading() {
  const ghosts = [
    { tilt: -2, op: 0.9 },
    { tilt: 1.5, op: 0.7 },
    { tilt: -1, op: 0.5 },
    { tilt: 2, op: 0.3 },
  ];

  return (
    <div className="min-h-screen bg-[#101A2C] text-[#F5EEDC] flex flex-col items-center justify-between py-20 px-6 relative overflow-hidden bg-[radial-gradient(ellipse_45%_75%_at_50%_0%,rgba(242,184,75,0.30),rgba(16,26,44,0)_70%)]">
      <div className="flex flex-col items-center gap-6 text-center max-w-lg mt-8">
        <svg
          width="88"
          height="88"
          viewBox="0 0 72 72"
          aria-hidden="true"
          className="animate-pulse"
        >
          <circle
            cx="36"
            cy="36"
            r="33"
            fill="none"
            stroke="#F2B84B"
            strokeWidth="2.5"
          />
          <polygon
            points="36,14 41.3,28.7 56.9,29.2 44.6,38.8 48.9,53.8 36,45 23.1,53.8 27.4,38.8 15.1,29.2 30.7,28.7"
            fill="#F2B84B"
          />
        </svg>

        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-heading font-extrabold text-[44px] sm:text-[56px] leading-[1.05] tracking-[-0.02em]">
            Hall of Fame
          </h1>
          <span className="text-[12px] sm:text-[13px] text-[#A9B3C7] tracking-[0.16em] uppercase">
            UET Lahore · Faisalabad Campus
          </span>
        </div>

        <div className="flex flex-col items-center gap-3 mt-4">
          <div className="w-[280px] sm:w-[320px] h-[6px] rounded-full bg-white/10 overflow-hidden relative">
            <div className="w-1/2 h-full rounded-full bg-[#F2B84B] animate-[shimmer_1.5s_infinite_linear] bg-gradient-to-r from-[#F2B84B] to-[#FFD27A]" />
          </div>
          <span className="text-[15px] text-[#A9B3C7]">
            Switching on the lights…
          </span>
        </div>
      </div>

      {/* Ghost hanging plaques */}
      <div className="hidden sm:flex items-start justify-center gap-8 sm:gap-12 pb-8">
        {ghosts.map((g, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center"
            style={{
              transform: `rotate(${g.tilt}deg)`,
              opacity: g.op,
            }}
          >
            <svg
              width="80"
              height="22"
              viewBox="0 0 100 26"
              aria-hidden="true"
            >
              <circle cx="50" cy="5" r="4" fill="#6E7A94" />
              <path
                d="M50 5 L12 26 M50 5 L88 26"
                stroke="#6E7A94"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            <div className="w-[140px] border-2 border-dashed border-[#F5EEDC]/35 rounded-[6px] p-2.5 flex flex-col gap-2">
              <div className="h-[70px] rounded-[3px] bg-white/[0.08]" />
              <div className="h-[10px] w-4/5 rounded-full bg-white/[0.12]" />
              <div className="h-[8px] w-3/5 rounded-full bg-white/[0.08]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

