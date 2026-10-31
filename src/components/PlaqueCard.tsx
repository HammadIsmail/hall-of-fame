import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plaque, Tier } from '@/lib/types';

interface PlaqueCardProps {
  plaque: Partial<Plaque> & {
    id?: number | string;
    name: string;
    title: string;
    initials?: string;
    wing_name?: string;
    wing?: string;
    tier?: Tier | string;
    year?: string;
    photo_url?: string | null;
  };
  tilt?: number;
  compact?: boolean;
  wireWidth?: number;
}

export function getTierStyles(tier: string = 'Campus') {
  const t = tier.toLowerCase();
  if (t === 'international') {
    return { frame: '#F2B84B', tint: '#F6D98F' };
  }
  if (t === 'national') {
    return { frame: '#C9D2E0', tint: '#D5DCE8' };
  }
  return { frame: '#C98A5A', tint: '#E7C3A3' };
}

export default function PlaqueCard({
  plaque,
  tilt = 0,
  compact = false,
  wireWidth = 120,
}: PlaqueCardProps) {
  const tier = plaque.tier || 'Campus';
  const { frame, tint } = getTierStyles(tier);
  const initials = plaque.initials || plaque.name.slice(0, 2).toUpperCase();
  const wingName = plaque.wing_name || (plaque as any).wing || 'Campus';
  const year = plaque.year || '2026';
  const href = plaque.id ? `/plaque/${plaque.id}` : '#';

  return (
    <Link
      href={href}
      className="group block no-underline focus:outline-none"
      style={{
        transform: `rotate(${tilt}deg)`,
        transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.2s ease',
      }}
    >
      <div className="flex flex-col items-center group-hover:-translate-y-1 group-focus:-translate-y-1 transition-transform">
        {/* Hanging wire SVG */}
        <svg
          width={wireWidth}
          height={28}
          viewBox="0 0 120 28"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          <circle cx="60" cy="5" r="4" fill="#F2B84B" />
          <path
            d="M60 5 L14 28 M60 5 L106 28"
            stroke="#6E7A94"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Plaque frame and content */}
        <div
          style={{
            backgroundColor: '#F5EEDC',
            borderColor: frame,
            borderWidth: '7px',
            borderStyle: 'solid',
          }}
          className={`w-full rounded-[8px] p-3.5 flex flex-col gap-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)] group-hover:shadow-[0_24px_50px_rgba(0,0,0,0.6)] transition-all`}
        >
          {/* Avatar / Photo */}
          <div
            style={{ backgroundColor: tint }}
            className={`w-full ${
              compact ? 'h-[140px]' : 'h-[180px]'
            } rounded-[3px] overflow-hidden flex items-center justify-center font-heading font-extrabold text-[48px] sm:text-[56px] text-[#101A2C] select-none relative`}
          >
            {plaque.photo_url ? (
              <img
                src={plaque.photo_url}
                alt={plaque.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </div>

          {/* Name */}
          <div className="font-heading font-extrabold text-[20px] sm:text-[22px] !text-[#101A2C] leading-[1.15] truncate">
            {plaque.name}
          </div>

          {/* Title */}
          <div className="text-[14px] sm:text-[15px] !text-[#2E3850] leading-[1.35] line-clamp-2 min-h-[40px]">
            {plaque.title}
          </div>

          {/* Badges footer */}
          <div className="flex gap-2 items-center flex-wrap text-[12px] font-bold !text-[#101A2C] pt-1">
            <span className="bg-[#101A2C] text-[#F5EEDC] px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wide">
              {wingName}
            </span>
            <span className="text-[#101A2C]/80">
              {year} · {tier}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

