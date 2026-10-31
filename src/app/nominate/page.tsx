'use client';

import React, { useState, useRef, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getTierStyles } from '@/components/PlaqueCard';
import { UploadCloud, Check, AlertCircle, Loader2 } from 'lucide-react';

const WINGS = [
  { id: 'academics', name: 'Academics' },
  { id: 'competitions', name: 'Competitions' },
  { id: 'research', name: 'Research & Innovation' },
  { id: 'sports', name: 'Sports' },
  { id: 'arts', name: 'Arts & Culture' },
  { id: 'community', name: 'Community Service' },
];

const TIERS = ['Campus', 'National', 'International'];

export default function NominatePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [name, setName] = useState('');
  const [deptBatch, setDeptBatch] = useState('');
  const [title, setTitle] = useState('');
  const [wingId, setWingId] = useState('competitions');
  const [tier, setTier] = useState('National');
  const [year, setYear] = useState('2026');
  const [story, setStory] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [submitterName, setSubmitterName] = useState('');
  const [submitterContact, setSubmitterContact] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  // Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedWing = WINGS.find(w => w.id === wingId) || WINGS[1];
  const tierStyles = getTierStyles(tier);

  const initials = name.trim()
    ? name.trim().split(/\s+/).length === 1
      ? name.trim().slice(0, 2).toUpperCase()
      : (name.trim().split(/\s+/)[0][0] + name.trim().split(/\s+/).slice(-1)[0][0]).toUpperCase()
    : '?';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter the nominee’s name');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please describe the achievement in one line');
      return;
    }
    if (!confirmed) {
      setErrorMessage('Please check the confirmation box to proceed');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('dept_batch', deptBatch);
      formData.append('title', title);
      formData.append('wing_id', wingId);
      formData.append('wing_name', selectedWing.name);
      formData.append('tier', tier);
      formData.append('year', year);
      formData.append('story', story);
      formData.append('proof_url', proofUrl);
      formData.append('submitter_name', submitterName);
      formData.append('submitter_contact', submitterContact);
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await fetch('/api/plaques', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit nomination');
      }

      router.push(
        `/nominate/sent?ref=${encodeURIComponent(data.reference_id)}&name=${encodeURIComponent(
          name
        )}&initials=${encodeURIComponent(initials)}`
      );
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Submission failed. Please check your network and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#101A2C] text-[#F5EEDC] font-sans">
      <Header />

      <main className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 py-12 sm:py-16 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          {/* Main Nomination Form */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 w-full flex flex-col gap-10"
          >
            {/* Header intro */}
            <div className="flex flex-col gap-3">
              <span className="text-[12px] sm:text-[13px] font-bold tracking-[0.16em] uppercase text-[#F2B84B]">
                Nominate a legend
              </span>
              <h1 className="m-0 font-heading font-extrabold text-[38px] sm:text-[52px] leading-[1.05] tracking-[-0.02em] text-[#F5EEDC]">
                Tell us what they pulled off.
              </h1>
              <p className="m-0 text-[16px] sm:text-[18px] leading-[1.5] text-[#A9B3C7]">
                No account needed. The Curator reviews every nomination before it appears on the wall.
              </p>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-3 p-4 rounded-[12px] bg-red-950/50 border border-red-500/40 text-red-200 text-sm">
                <AlertCircle size={20} className="flex-shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Fieldset 1: Who is the legend */}
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-5">
              <legend className="p-0 mb-3 font-heading font-extrabold text-[22px] sm:text-[24px] text-[#F5EEDC]">
                1 · Who is the legend?
              </legend>

              <label className="flex flex-col gap-2 text-[14px] font-bold">
                <span>Full name *</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name as it should appear on the plaque"
                  className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B] transition-colors"
                />
              </label>

              <label className="flex flex-col gap-2 text-[14px] font-bold">
                <span>Department and batch</span>
                <input
                  type="text"
                  value={deptBatch}
                  onChange={e => setDeptBatch(e.target.value)}
                  placeholder="For example, Computer Science, 2023"
                  className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B] transition-colors"
                />
              </label>
            </fieldset>

            {/* Fieldset 2: What did they achieve */}
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-6">
              <legend className="p-0 mb-3 font-heading font-extrabold text-[22px] sm:text-[24px] text-[#F5EEDC]">
                2 · What did they achieve?
              </legend>

              <label className="flex flex-col gap-2 text-[14px] font-bold">
                <span>Achievement in one line *</span>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="For example, 1st position at an inter-university competition"
                  className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B] transition-colors"
                />
              </label>

              {/* Wing Choice */}
              <div className="flex flex-col gap-2.5">
                <span className="text-[14px] font-bold">Wing</span>
                <div className="flex flex-wrap gap-2.5">
                  {WINGS.map(w => {
                    const isSelected = wingId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWingId(w.id)}
                        className={`min-h-[44px] px-4 sm:px-5 rounded-full font-bold text-[14px] sm:text-[15px] transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[1.5px] border-[#F2B84B] bg-[#F2B84B] btn-gold !text-[#101A2C]'
                            : 'border-[1.5px] border-[#F5EEDC]/28 bg-transparent text-[#F5EEDC] hover:border-white'
                        }`}
                      >
                        {w.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Level and Year */}
              <div className="flex flex-wrap gap-6 items-start">
                <div className="flex-2 min-w-[260px] flex flex-col gap-2.5">
                  <span className="text-[14px] font-bold">Level</span>
                  <div className="flex flex-wrap gap-2.5">
                    {TIERS.map(t => {
                      const isSelected = tier === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTier(t)}
                          className={`min-h-[44px] px-5 rounded-full font-bold text-[14px] sm:text-[15px] transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[1.5px] border-[#F2B84B] bg-[#F2B84B] btn-gold !text-[#101A2C]'
                              : 'border-[1.5px] border-[#F5EEDC]/28 bg-transparent text-[#F5EEDC] hover:border-white'
                          }`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex-1 min-w-[140px] flex flex-col gap-2 text-[14px] font-bold">
                  <span>Year</span>
                  <input
                    type="text"
                    value={year}
                    onChange={e => setYear(e.target.value)}
                    placeholder="2026"
                    className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B]"
                  />
                </label>
              </div>

              {/* The story */}
              <label className="flex flex-col gap-2 text-[14px] font-bold">
                <span>The story</span>
                <textarea
                  rows={5}
                  value={story}
                  onChange={e => setStory(e.target.value)}
                  placeholder="What happened, how they prepared, and why it matters to the campus"
                  className="p-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] leading-[1.5] outline-none focus:border-[#F2B84B] resize-y"
                />
              </label>
            </fieldset>

            {/* Fieldset 3: Photo and proof */}
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-5">
              <legend className="p-0 mb-3 font-heading font-extrabold text-[22px] sm:text-[24px] text-[#F5EEDC]">
                3 · Photo and proof
              </legend>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-3 p-8 rounded-[16px] border-2 border-dashed border-[#F5EEDC]/35 hover:border-[#F2B84B] text-center cursor-pointer transition-colors bg-white/[0.02] hover:bg-white/[0.04]"
              >
                <UploadCloud size={36} className="text-[#F2B84B]" />
                <span className="text-[15px] text-[#A9B3C7]">
                  {photoFile
                    ? `Selected: ${photoFile.name} (Click to change)`
                    : 'Add a clear photo of the person or the award. JPG or PNG.'}
                </span>
                <button
                  type="button"
                  className="min-h-[44px] px-6 rounded-full border-[1.5px] border-[#F2B84B] text-[#F2B84B] font-bold text-[15px] bg-transparent pointer-events-none"
                >
                  {photoFile ? 'Change photo' : 'Choose photo'}
                </button>
              </div>

              <label className="flex flex-col gap-2 text-[14px] font-bold">
                <span>Proof link (optional)</span>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="News post, certificate or event page (https://...)"
                  className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B]"
                />
              </label>
            </fieldset>

            {/* Fieldset 4: Your details */}
            <fieldset className="m-0 p-0 border-0 flex flex-col gap-5">
              <legend className="p-0 mb-1 font-heading font-extrabold text-[22px] sm:text-[24px] text-[#F5EEDC]">
                4 · Your details
              </legend>
              <p className="m-0 mb-3 text-[14px] text-[#A9B3C7]">
                Only the Curator sees this, in case a question comes up. Never shown publicly.
              </p>

              <div className="flex flex-wrap gap-5">
                <label className="flex-1 min-w-[220px] flex flex-col gap-2 text-[14px] font-bold">
                  <span>Your name (optional)</span>
                  <input
                    type="text"
                    value={submitterName}
                    onChange={e => setSubmitterName(e.target.value)}
                    className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B]"
                  />
                </label>

                <label className="flex-1 min-w-[220px] flex flex-col gap-2 text-[14px] font-bold">
                  <span>Email or phone (optional)</span>
                  <input
                    type="text"
                    value={submitterContact}
                    onChange={e => setSubmitterContact(e.target.value)}
                    className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B]"
                  />
                </label>
              </div>

              <label className="flex items-start gap-3 text-[15px] leading-[1.5] text-[#F5EEDC] cursor-pointer pt-2">
                <input
                  type="checkbox"
                  required
                  checked={confirmed}
                  onChange={e => setConfirmed(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-[#F2B84B] rounded cursor-pointer"
                />
                <span>
                  I confirm this achievement is true and the person is fine with it being shown on the Hall of Fame.
                </span>
              </label>
            </fieldset>

            {/* Form Submit */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
                className="btn-gold inline-flex items-center justify-center gap-2 !text-[#101A2C] px-9 py-4 rounded-full font-bold text-[17px] shadow-lg transition-all cursor-pointer active:scale-95"
              >
                {isSubmitting && <Loader2 size={20} className="animate-spin" />}
                {isSubmitting ? 'Sending to Curator…' : 'Send to the Curator'}
              </button>

              <Link
                href="/"
                className="text-[#A9B3C7] hover:text-white text-[15px] font-bold px-4 py-2 no-underline"
              >
                Cancel
              </Link>
            </div>
          </form>

          {/* Right Column: Live Interactive Preview */}
          <aside className="w-full lg:w-[380px] lg:sticky lg:top-24 flex-shrink-0 flex flex-col gap-8">
            <span className="text-[13px] font-bold tracking-[0.16em] uppercase text-[#A9B3C7]">
              Live preview
            </span>

            {/* Preview plaque */}
            <div
              style={{ transform: 'rotate(1.2deg)' }}
              className="flex flex-col items-center transition-transform"
            >
              <svg width="120" height="28" viewBox="0 0 120 28" aria-hidden="true">
                <circle cx="60" cy="5" r="4" fill="#F2B84B" />
                <path
                  d="M60 5 L14 28 M60 5 L106 28"
                  stroke="#6E7A94"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>

              <div
                style={{
                  backgroundColor: '#F5EEDC',
                  borderColor: tierStyles.frame,
                  borderWidth: '7px',
                  borderStyle: 'solid',
                }}
                className="w-full rounded-[6px] p-3.5 flex flex-col gap-3 shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
              >
                <div
                  style={{ backgroundColor: tierStyles.tint }}
                  className="h-[180px] rounded-[3px] overflow-hidden flex items-center justify-center font-heading font-extrabold text-[56px] text-[#101A2C] select-none"
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>

                <div className="font-heading font-extrabold text-[22px] text-[#101A2C] leading-[1.15] truncate">
                  {name.trim() || "Nominee's name"}
                </div>

                <div className="text-[15px] text-[#2E3850] leading-[1.35] line-clamp-2 min-h-[40px]">
                  {title.trim() || 'The achievement appears here as you type it.'}
                </div>

                <div className="flex gap-2 items-center flex-wrap text-[12px] font-bold text-[#101A2C] pt-1">
                  <span className="bg-[#101A2C] text-[#F5EEDC] px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wide">
                    {selectedWing.name}
                  </span>
                  <span>
                    {year || '2026'} · {tier}
                  </span>
                </div>
              </div>
            </div>

            {/* What happens next box */}
            <div className="p-6 rounded-[16px] bg-[#182640] border border-white/10 flex flex-col gap-3">
              <h3 className="m-0 font-heading font-extrabold text-[20px] text-[#F5EEDC]">
                What happens next
              </h3>
              <p className="m-0 text-[15px] leading-[1.5] text-[#A9B3C7]">
                Your nomination goes directly to the Curator’s review queue. It is published on the campus wall after verification.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

