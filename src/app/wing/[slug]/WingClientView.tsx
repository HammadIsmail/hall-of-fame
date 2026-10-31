'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import PlaqueCard from '@/components/PlaqueCard';
import WingIcon from '@/components/WingIcon';
import { Plaque, Wing } from '@/lib/types';
import { Plus } from 'lucide-react';

interface WingClientViewProps {
  wing: Wing;
  initialPlaques: Plaque[];
}

export default function WingClientView({ wing, initialPlaques }: WingClientViewProps) {
  const [selectedTier, setSelectedTier] = useState<string>('All levels');
  const [selectedYear, setSelectedYear] = useState<string>('All years');
  const [sortBy, setSortBy] = useState<string>('Newest first');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  // Derive unique years from plaques
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    initialPlaques.forEach(p => {
      if (p.year) years.add(p.year);
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [initialPlaques]);

  // Filtered & sorted plaques
  const filteredPlaques = useMemo(() => {
    let list = [...initialPlaques];

    if (selectedTier !== 'All levels') {
      list = list.filter(p => p.tier.toLowerCase() === selectedTier.toLowerCase());
    }

    if (selectedYear !== 'All years') {
      list = list.filter(p => p.year === selectedYear);
    }

    if (sortBy === 'Newest first') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'Oldest first') {
      list.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    } else if (sortBy === 'Highest level') {
      const tierRank: Record<string, number> = {
        international: 1,
        national: 2,
        campus: 3,
      };
      list.sort(
        (a, b) =>
          (tierRank[a.tier.toLowerCase()] || 4) - (tierRank[b.tier.toLowerCase()] || 4)
      );
    }

    return list;
  }, [initialPlaques, selectedTier, selectedYear, sortBy]);

  const displayedPlaques = filteredPlaques.slice(0, visibleCount);
  const hasMore = filteredPlaques.length > visibleCount;

  return (
    <div className="flex-1 flex flex-col">
      {/* Wing Hero Banner */}
      <section className="bg-[radial-gradient(ellipse_55%_100%_at_20%_0%,rgba(242,184,75,0.20),rgba(16,26,44,0)_70%)]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 py-12 sm:py-14 flex flex-col gap-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[14px] text-[#A9B3C7]">
            <Link href="/" className="text-[#A9B3C7] hover:text-[#F2B84B] no-underline">
              Hall
            </Link>
            <span aria-hidden="true">/</span>
            <Link href="/#wings" className="text-[#A9B3C7] hover:text-[#F2B84B] no-underline">
              Wings
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[#F5EEDC] font-medium">{wing.name}</span>
          </div>

          {/* Wing Title and Icon */}
          <div className="flex items-center gap-6 flex-wrap">
            <span className="flex-shrink-0 w-20 h-20 rounded-full bg-[#F2B84B]/15 flex items-center justify-center">
              <WingIcon path={wing.icon_path} slugOrId={wing.slug} size={40} />
            </span>
            <h1 className="m-0 font-heading font-extrabold text-[42px] sm:text-[60px] lg:text-[64px] leading-[1.05] tracking-[-0.02em] text-[#F5EEDC]">
              {wing.name} Wing
            </h1>
          </div>

          <p className="m-0 text-[17px] sm:text-[19px] leading-[1.5] text-[#A9B3C7] max-w-[640px]">
            {wing.blurb}
          </p>
        </div>
      </section>

      {/* Filter and Sort Toolbar */}
      <section className="border-b border-white/10 bg-[#101A2C]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 py-4 flex flex-wrap items-center justify-between gap-4">
          {/* Level Filter Buttons */}
          <div className="flex flex-wrap gap-2.5">
            {['All levels', 'Campus', 'National', 'International'].map(tier => {
              const isActive = selectedTier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedTier(tier)}
                  aria-pressed={isActive}
                  className={`min-h-[42px] px-5 rounded-full font-bold text-[14px] sm:text-[15px] transition-all cursor-pointer ${
                    isActive
                      ? 'border-[1.5px] border-[#F2B84B] bg-[#F2B84B] btn-gold !text-[#101A2C]'
                      : 'border-[1.5px] border-[#F5EEDC]/25 hover:border-[#F5EEDC]/60 bg-transparent text-[#F5EEDC]'
                  }`}
                >
                  {tier}
                </button>
              );
            })}
          </div>

          {/* Year and Sort Selectors */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2.5 text-[14px] text-[#A9B3C7]">
              <span>Year</span>
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="bg-[#182640] text-[#F5EEDC] border border-white/20 rounded-[10px] px-3.5 py-2 min-h-[42px] text-[14px] font-medium outline-none focus:border-[#F2B84B]"
              >
                <option value="All years">All years</option>
                {availableYears.map(y => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2.5 text-[14px] text-[#A9B3C7]">
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-[#182640] text-[#F5EEDC] border border-white/20 rounded-[10px] px-3.5 py-2 min-h-[42px] text-[14px] font-medium outline-none focus:border-[#F2B84B]"
              >
                <option value="Newest first">Newest first</option>
                <option value="Highest level">Highest level</option>
                <option value="Oldest first">Oldest first</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Plaques Grid OR Empty State */}
      <section className="py-12 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16">
          {displayedPlaques.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
              {displayedPlaques.map((p, idx) => {
                const tilts = [-1.2, 1, -0.8, 1.2, -1, 0.9, -1.3, 0.8];
                return (
                  <div key={p.id} className="flex justify-center">
                    <div className="w-full max-w-[290px]">
                      <PlaqueCard plaque={p} tilt={tilts[idx % tilts.length]} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Empty Wing State */
            <div className="flex flex-col items-center gap-8 text-center py-12 max-w-lg mx-auto">
              {/* Dashed placeholder hanging plaque */}
              <div className="flex flex-col items-center" style={{ transform: 'rotate(-2deg)' }}>
                <svg width="140" height="34" viewBox="0 0 120 28" aria-hidden="true">
                  <circle cx="60" cy="5" r="4" fill="#F2B84B" />
                  <path
                    d="M60 5 L14 28 M60 5 L106 28"
                    stroke="#6E7A94"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>
                <div className="w-[280px] border-[3px] border-dashed border-[#F5EEDC]/40 rounded-[8px] p-4 flex flex-col gap-3 bg-white/[0.03]">
                  <div className="h-[150px] rounded-[4px] bg-white/[0.06] flex items-center justify-center text-[#6E7A94]">
                    <Plus size={48} strokeWidth={1.5} />
                  </div>
                  <div className="h-3.5 w-[70%] rounded-full bg-white/[0.12] mx-auto" />
                  <div className="h-2.5 w-[90%] rounded-full bg-white/[0.08] mx-auto" />
                </div>
              </div>

              <div className="flex flex-col items-center gap-3">
                <h2 className="m-0 font-heading font-extrabold text-[36px] sm:text-[44px] leading-[1.1] text-[#F5EEDC]">
                  This wall is still bare.
                </h2>
                <p className="m-0 text-[16px] sm:text-[18px] leading-[1.55] text-[#A9B3C7]">
                  No plaques match this filter in the {wing.name} Wing yet. Know someone whose achievement belongs here? Be the first to nominate them.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <Link
                  href={`/nominate?wing=${wing.id}`}
                  style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
                  className="btn-gold inline-flex items-center justify-center !text-[#101A2C] px-7 py-3.5 rounded-full font-bold text-[16px] no-underline transition-all shadow-md active:scale-95"
                >
                  Hang the first plaque
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTier('All levels');
                    setSelectedYear('All years');
                  }}
                  className="border-[1.5px] border-[#F5EEDC]/45 hover:border-[#F5EEDC] text-[#F5EEDC] px-7 py-3.5 rounded-full font-bold text-[16px] transition-all"
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}

          {/* Show more button */}
          {hasMore && (
            <div className="flex justify-center pt-12 sm:pt-16">
              <button
                type="button"
                onClick={() => setVisibleCount(c => c + 12)}
                className="min-h-[50px] px-8 rounded-full border-[1.5px] border-[#F5EEDC]/45 hover:border-[#F5EEDC] hover:bg-white/5 bg-transparent text-[#F5EEDC] font-bold text-[16px] transition-all cursor-pointer"
              >
                Show more plaques
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

