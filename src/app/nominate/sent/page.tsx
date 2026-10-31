'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Check } from 'lucide-react';

function SentContent() {
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref') || 'NOM-PENDING';
  const name = searchParams.get('name') || 'Your nominee';
  const initials = searchParams.get('initials') || 'AK';

  return (
    <div className="flex-1 flex items-center justify-center py-12 sm:py-20 px-6 sm:px-8 bg-[radial-gradient(ellipse_45%_80%_at_30%_20%,rgba(242,184,75,0.22),rgba(16,26,44,0)_70%)]">
      <div className="max-w-[1000px] w-full flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-20">
        {/* Hanging Plaque with Pending Stamp */}
        <div className="relative flex flex-col items-center flex-shrink-0" style={{ transform: 'rotate(-3deg)' }}>
          <svg width="120" height="30" viewBox="0 0 120 28" aria-hidden="true">
            <circle cx="60" cy="5" r="4" fill="#F2B84B" />
            <path
              d="M60 5 L14 28 M60 5 L106 28"
              stroke="#6E7A94"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          <div className="w-[280px] bg-[#F5EEDC] border-[7px] border-[#C9D2E0] rounded-[6px] p-3.5 flex flex-col gap-3 shadow-[0_24px_50px_rgba(0,0,0,0.5)]">
            <div className="h-[150px] rounded-[3px] bg-[#D5DCE8] flex items-center justify-center font-heading font-extrabold text-[56px] text-[#101A2C]">
              {initials}
            </div>
            <div className="font-heading font-extrabold text-[22px] text-[#101A2C] truncate">
              {name}
            </div>
            <div className="text-[14px] text-[#2E3850] leading-[1.35]">
              Waiting for the Curator&apos;s review
            </div>
          </div>

          {/* Pending Rubber Stamp */}
          <div
            style={{ transform: 'rotate(-12deg)' }}
            className="absolute -right-6 bottom-8 border-[3px] border-[#F2B84B] text-[#F2B84B] bg-[#101A2C] rounded-[8px] px-4 py-2 font-heading font-extrabold text-[20px] tracking-[0.12em] uppercase shadow-lg select-none"
          >
            Pending
          </div>
        </div>

        {/* Success Message & Actions */}
        <div className="max-w-[500px] flex flex-col gap-6 text-center md:text-left">
          <span className="w-14 h-14 rounded-full bg-[#5BD6A4] flex items-center justify-center text-[#101A2C] mx-auto md:mx-0 shadow-md">
            <Check size={28} strokeWidth={2.6} />
          </span>

          <h1 className="m-0 font-heading font-extrabold text-[42px] sm:text-[56px] leading-[1.05] tracking-[-0.02em] text-[#F5EEDC]">
            Sent to the Curator.
          </h1>

          <p className="m-0 text-[17px] sm:text-[19px] leading-[1.55] text-[#A9B3C7]">
            Your nomination is in the review queue. Once it is approved, the plaque goes up on the wall for everyone to see.
          </p>

          <div className="text-[14px] font-mono tracking-wider text-[#F2B84B] bg-[#182640] px-3.5 py-2 rounded-lg self-center md:self-start border border-white/10">
            Reference: {ref}
          </div>

          <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-2">
            <Link
              href="/"
              style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
              className="btn-gold inline-flex items-center justify-center !text-[#101A2C] px-7 py-3.5 rounded-full font-bold text-[16px] no-underline shadow-md transition-all active:scale-95"
            >
              Back to the Hall
            </Link>
            <Link
              href="/nominate"
              className="border-[1.5px] border-[#F5EEDC]/45 hover:border-[#F5EEDC] text-[#F5EEDC] px-7 py-3.5 rounded-full font-bold text-[16px] no-underline transition-all active:scale-95"
            >
              Nominate another
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SentPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#101A2C] text-[#F5EEDC] font-sans">
      <Header />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading confirmation…</div>}>
        <SentContent />
      </Suspense>
      <Footer />
    </div>
  );
}

