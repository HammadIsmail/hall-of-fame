'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, Share2, AlertCircle, ExternalLink } from 'lucide-react';
import PlaqueCard, { getTierStyles } from '@/components/PlaqueCard';
import { Plaque } from '@/lib/types';

interface PlaqueDetailClientProps {
  plaque: Plaque & { wing_slug?: string };
  more: Plaque[];
}

export default function PlaqueDetailClient({ plaque, more }: PlaqueDetailClientProps) {
  const [copied, setCopied] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const tierStyles = getTierStyles(plaque.tier);
  const initials = plaque.initials || plaque.name.slice(0, 2).toUpperCase();
  const backWingHref = plaque.wing_slug ? `/wing/${plaque.wing_slug}` : '/#wings';
  const approvedDateStr = plaque.approved_at
    ? new Date(plaque.approved_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const handleShare = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // fallback
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportSent(true);
    setTimeout(() => {
      setReportOpen(false);
      setReportSent(false);
      setReportNote('');
    }, 2000);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Plaque Showcase Section */}
      <section className="bg-[radial-gradient(ellipse_50%_70%_at_25%_0%,rgba(242,184,75,0.22),rgba(16,26,44,0)_70%)] py-10 sm:py-16">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 flex flex-col gap-10">
          {/* Back link */}
          <Link
            href={backWingHref}
            className="inline-flex items-center gap-2 text-[#A9B3C7] hover:text-[#F2B84B] no-underline text-[15px] font-medium min-h-[44px] transition-colors"
          >
            <ArrowLeft size={18} />
            Back to {plaque.wing_name} Wing
          </Link>

          {/* Plaque and Details 2-Column Layout */}
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
            {/* Left Column: Large Hanging Plaque */}
            <div className="w-full lg:w-[460px] flex-shrink-0 flex flex-col items-center">
              <div
                style={{ transform: 'rotate(-1.5deg)' }}
                className="w-full max-w-[420px] transition-transform hover:rotate-0 duration-300"
              >
                {/* Wire */}
                <svg
                  width="160"
                  height="40"
                  viewBox="0 0 120 28"
                  aria-hidden="true"
                  className="mx-auto"
                >
                  <circle cx="60" cy="5" r="4" fill="#F2B84B" />
                  <path
                    d="M60 5 L14 28 M60 5 L106 28"
                    stroke="#6E7A94"
                    strokeWidth="1.5"
                    fill="none"
                  />
                </svg>

                {/* Plaque frame */}
                <div
                  style={{
                    backgroundColor: '#F5EEDC',
                    borderColor: tierStyles.frame,
                    borderWidth: '10px',
                    borderStyle: 'solid',
                  }}
                  className="w-full rounded-[10px] p-5 flex flex-col gap-4 shadow-[0_28px_60px_rgba(0,0,0,0.55)]"
                >
                  <div
                    style={{ backgroundColor: tierStyles.tint }}
                    className="h-[360px] sm:h-[420px] rounded-[4px] overflow-hidden flex items-center justify-center font-heading font-extrabold text-[90px] sm:text-[120px] text-[#101A2C] select-none"
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
                  <div className="text-center text-[12px] font-bold tracking-[0.16em] uppercase text-[#101A2C]">
                    {plaque.tier} · {plaque.year}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Narrative and Metadata */}
            <div className="flex-1 flex flex-col gap-7">
              {/* Badges */}
              <div className="flex flex-wrap gap-2.5">
                <span
                  style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
                  className="btn-gold !text-[#101A2C] px-3.5 py-1 rounded-full text-[13px] font-bold"
                >
                  {plaque.tier}
                </span>
                <span className="border-[1.5px] border-[#F5EEDC]/35 text-[#F5EEDC] px-3.5 py-1 rounded-full text-[13px] font-bold">
                  {plaque.wing_name}
                </span>
              </div>

              {/* Title & Name */}
              <h1 className="m-0 font-heading font-extrabold text-[44px] sm:text-[56px] lg:text-[64px] leading-[1.02] tracking-[-0.02em] text-[#F5EEDC]">
                {plaque.name}
              </h1>

              <p className="m-0 font-heading font-semibold text-[22px] sm:text-[28px] leading-[1.25] text-[#F2B84B]">
                {plaque.title}
              </p>

              {/* Story */}
              <p className="m-0 text-[17px] sm:text-[18px] leading-[1.65] text-[#A9B3C7] max-w-[620px] whitespace-pre-line">
                {plaque.story ||
                  'Wins and feats by students and alumni of UET Lahore, Faisalabad Campus. Plaque details confirmed by the Curator.'}
              </p>

              {/* Meta details list */}
              <dl className="m-0 grid grid-cols-2 sm:grid-cols-4 gap-6 py-6 border-y border-white/12">
                <div className="flex flex-col gap-1">
                  <dt className="text-[12px] tracking-[0.12em] uppercase text-[#A9B3C7]">
                    Wing
                  </dt>
                  <dd className="m-0 text-[16px] sm:text-[17px] font-bold text-[#F5EEDC]">
                    {plaque.wing_name}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[12px] tracking-[0.12em] uppercase text-[#A9B3C7]">
                    Year
                  </dt>
                  <dd className="m-0 text-[16px] sm:text-[17px] font-bold text-[#F5EEDC]">
                    {plaque.year}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[12px] tracking-[0.12em] uppercase text-[#A9B3C7]">
                    Department & Batch
                  </dt>
                  <dd className="m-0 text-[16px] sm:text-[17px] font-bold text-[#F5EEDC]">
                    {plaque.dept_batch || 'Alumni / Student'}
                  </dd>
                </div>
                <div className="flex flex-col gap-1">
                  <dt className="text-[12px] tracking-[0.12em] uppercase text-[#A9B3C7]">
                    Proof
                  </dt>
                  <dd className="m-0 text-[16px] sm:text-[17px] font-bold text-[#F2B84B]">
                    {plaque.proof_url ? (
                      <a
                        href={plaque.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#F2B84B] hover:text-[#FFD27A] no-underline"
                      >
                        View source
                        <ExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="text-[#A9B3C7] text-sm font-normal">Verified on campus</span>
                    )}
                  </dd>
                </div>
              </dl>

              {/* Action Buttons & Curator Date */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <span className="text-[14px] text-[#A9B3C7]">
                  Approved by the Curator on {approvedDateStr}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleShare}
                    style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
                    className="btn-gold inline-flex items-center gap-2 min-h-[48px] px-6 rounded-full !text-[#101A2C] font-bold text-[15px] cursor-pointer transition-all active:scale-95"
                  >
                    {copied ? <Check size={18} /> : <Share2 size={18} />}
                    {copied ? 'Link copied!' : 'Share plaque'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportOpen(true)}
                    className="inline-flex items-center gap-1.5 min-h-[48px] px-6 rounded-full border-[1.5px] border-[#F5EEDC]/45 hover:border-[#F5EEDC] text-[#F5EEDC] font-bold text-[15px] bg-transparent cursor-pointer transition-all active:scale-95"
                  >
                    <AlertCircle size={17} />
                    Report a mistake
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Report Modal */}
      {reportOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#182640] border border-white/20 rounded-[18px] p-6 sm:p-8 max-w-md w-full flex flex-col gap-4 text-[#F5EEDC] shadow-2xl animate-in zoom-in-95">
            <h3 className="m-0 font-heading font-extrabold text-[22px]">
              Report a mistake
            </h3>
            <p className="m-0 text-sm text-[#A9B3C7]">
              Notice an inaccuracy on {plaque.name}&apos;s plaque? Let the Curator know what should be fixed.
            </p>
            {reportSent ? (
              <div className="p-4 rounded-xl bg-[#5BD6A4]/20 border border-[#5BD6A4] text-[#5BD6A4] text-center font-bold">
                Thank you. The Curator will review your feedback.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="flex flex-col gap-4">
                <textarea
                  rows={4}
                  required
                  value={reportNote}
                  onChange={e => setReportNote(e.target.value)}
                  placeholder="Describe the correction (e.g. spelling of name, year, or department)..."
                  className="w-full bg-[#101A2C] border border-white/20 rounded-[12px] p-3 text-[15px] text-[#F5EEDC] outline-none focus:border-[#F2B84B]"
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setReportOpen(false)}
                    className="px-5 py-2.5 rounded-full border border-white/20 text-[#A9B3C7] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-full bg-[#F2B84B] text-[#101A2C] font-bold hover:bg-[#FFD27A]"
                  >
                    Send note
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* More from this wing section */}
      {more.length > 0 && (
        <section className="bg-[#182640] border-t border-white/5 py-16 sm:py-20">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 flex flex-col gap-10">
            <h2 className="m-0 font-heading font-extrabold text-[32px] sm:text-[40px] leading-[1.1] text-[#F5EEDC]">
              More from the {plaque.wing_name} Wing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {more.map((p, idx) => {
                const tilts = [-1.2, 1, -0.8];
                return (
                  <div key={p.id} className="flex justify-center">
                    <div className="w-full max-w-[300px]">
                      <PlaqueCard plaque={p} tilt={tilts[idx % tilts.length]} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

