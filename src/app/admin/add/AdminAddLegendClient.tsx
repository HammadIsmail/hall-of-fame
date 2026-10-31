'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UploadCloud, Check, ArrowLeft, Loader2, Globe, LogOut } from 'lucide-react';
import { getTierStyles } from '@/components/PlaqueCard';
import { Wing } from '@/lib/types';

interface AdminAddLegendClientProps {
  wings: Wing[];
  user: { name: string; email: string };
}

const TIERS = ['Campus', 'National', 'International'];

export default function AdminAddLegendClient({ wings, user }: AdminAddLegendClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState('');
  const [deptBatch, setDeptBatch] = useState('');
  const [title, setTitle] = useState('');
  const [wingId, setWingId] = useState(wings[1]?.id || 'competitions');
  const [tier, setTier] = useState('National');
  const [year, setYear] = useState('2026');
  const [story, setStory] = useState('');
  const [proofUrl, setProofUrl] = useState('');

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedWing = wings.find(w => w.id === wingId) || wings[0];
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

  const handleSubmit = async (publishNow: boolean) => {
    if (!name.trim() || !title.trim()) {
      setError('Name and achievement title are required.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('dept_batch', deptBatch);
      formData.append('title', title);
      formData.append('wing_id', wingId);
      formData.append('wing_name', selectedWing?.name || 'General');
      formData.append('tier', tier);
      formData.append('year', year);
      formData.append('story', story);
      formData.append('proof_url', proofUrl);
      formData.append('publish_now', publishNow.toString());
      if (photoFile) {
        formData.append('photo', photoFile);
      }

      const res = await fetch('/api/admin/plaques/add', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add legend');

      router.push('/admin');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error creating plaque');
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="flex h-screen bg-[#0C1424] text-[#F5EEDC] font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-[#101A2C] border-r border-white/10 p-6 flex flex-col justify-between hidden md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="33" fill="none" stroke="#F2B84B" strokeWidth="3" />
              <polygon
                points="36,14 41.3,28.7 56.9,29.2 44.6,38.8 48.9,53.8 36,45 23.1,53.8 27.4,38.8 15.1,29.2 30.7,28.7"
                fill="#F2B84B"
              />
            </svg>
            <div className="flex flex-col leading-[1.15]">
              <span className="font-heading font-extrabold text-[18px]">Curator&apos;s Desk</span>
              <span className="text-[11px] text-[#A9B3C7] tracking-[0.1em] uppercase">Admin</span>
            </div>
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-2 min-h-[46px] px-4 rounded-full border border-white/20 text-[#F5EEDC] hover:bg-white/5 font-bold text-[14px] no-underline"
          >
            <ArrowLeft size={16} />
            Back to queue
          </Link>

          <nav className="flex flex-col gap-1.5 font-bold text-[15px]">
            <Link
              href="/admin"
              className="flex items-center min-h-[44px] px-3.5 rounded-[10px] text-[#F5EEDC] hover:bg-white/5 no-underline"
            >
              Nominations queue
            </Link>
            <Link
              href="/admin/wings"
              className="flex items-center min-h-[44px] px-3.5 rounded-[10px] text-[#F5EEDC] hover:bg-white/5 no-underline"
            >
              Manage wings
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3 text-[14px] pt-6 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-[#F5EEDC] hover:text-[#F2B84B] no-underline"
          >
            <Globe size={16} />
            View public site
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[#A9B3C7] hover:text-white bg-transparent border-0 p-0 text-left cursor-pointer"
          >
            <LogOut size={16} />
            Sign out ({user.name})
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between gap-6 px-6 sm:px-8 py-5 border-b border-white/10 bg-[#101A2C]">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-heading font-extrabold text-[26px] sm:text-[30px] leading-[1.1]">
              Add a legend
            </h1>
            <span className="text-[13px] text-[#A9B3C7]">
              Plaques you add yourself skip the review queue and go live straight away.
            </span>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full border border-white/20 text-[#F5EEDC] hover:bg-white/5 text-[14px] font-bold no-underline"
          >
            Back to queue
          </Link>
        </header>

        {/* 2-Column Split: Form & Live Preview */}
        <div className="flex-1 flex min-h-0 overflow-y-auto p-6 sm:p-8 gap-8 lg:gap-10 flex-col lg:flex-row">
          {/* Left: Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSubmit(true);
            }}
            className="flex-1 flex flex-col gap-5 min-w-0"
          >
            {error && (
              <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                <span>Full name *</span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name as it should appear on the plaque"
                  className="min-h-[48px] px-3.5 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[15px] outline-none focus:border-[#F2B84B]"
                />
              </label>

              <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                <span>Department and batch</span>
                <input
                  type="text"
                  value={deptBatch}
                  onChange={e => setDeptBatch(e.target.value)}
                  placeholder="For example, Computer Science, 2023"
                  className="min-h-[48px] px-3.5 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[15px] outline-none focus:border-[#F2B84B]"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-[13px] font-bold">
              <span>Achievement in one line *</span>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="For example, 1st position at an inter-university competition"
                className="min-h-[48px] px-3.5 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[15px] outline-none focus:border-[#F2B84B]"
              />
            </label>

            {/* Wing selector */}
            <div className="flex flex-col gap-2">
              <span className="text-[13px] font-bold">Wing</span>
              <div className="flex flex-wrap gap-2">
                {wings.map(w => {
                  const isSelected = wingId === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setWingId(w.id)}
                      className={`min-h-[40px] px-4 rounded-full font-bold text-[14px] cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[1.5px] border-[#F2B84B] bg-[#F2B84B] text-[#101A2C]'
                          : 'border-[1.5px] border-[#F5EEDC]/25 bg-transparent text-[#F5EEDC] hover:border-white'
                      }`}
                    >
                      {w.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level and Year */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[240px] flex flex-col gap-2">
                <span className="text-[13px] font-bold">Level</span>
                <div className="flex gap-2">
                  {TIERS.map(t => {
                    const isSelected = tier === t;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setTier(t)}
                        className={`min-h-[40px] px-4 rounded-full font-bold text-[14px] cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[1.5px] border-[#F2B84B] bg-[#F2B84B] text-[#101A2C]'
                            : 'border-[1.5px] border-[#F5EEDC]/25 bg-transparent text-[#F5EEDC] hover:border-white'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <label className="w-[140px] flex flex-col gap-1.5 text-[13px] font-bold">
                <span>Year</span>
                <input
                  type="text"
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  placeholder="2026"
                  className="min-h-[48px] px-3.5 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[15px] outline-none focus:border-[#F2B84B]"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1.5 text-[13px] font-bold">
              <span>The story</span>
              <textarea
                rows={4}
                value={story}
                onChange={e => setStory(e.target.value)}
                placeholder="What happened, and why it matters to the campus"
                className="p-3.5 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[15px] outline-none focus:border-[#F2B84B] resize-none"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 p-3.5 rounded-[14px] border-2 border-dashed border-[#F5EEDC]/35 hover:border-[#F2B84B] cursor-pointer bg-white/[0.02]"
              >
                <UploadCloud size={24} className="text-[#F2B84B] flex-shrink-0" />
                <span className="text-[13px] text-[#A9B3C7] flex-1 truncate">
                  {photoFile ? photoFile.name : 'Choose photo (JPG or PNG)'}
                </span>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-full border border-[#F2B84B] text-[#F2B84B] text-xs font-bold pointer-events-none"
                >
                  {photoFile ? 'Change' : 'Browse'}
                </button>
              </div>

              <label className="flex flex-col gap-1.5 text-[13px] font-bold">
                <span>Proof link (optional)</span>
                <input
                  type="url"
                  value={proofUrl}
                  onChange={e => setProofUrl(e.target.value)}
                  placeholder="News post or event page"
                  className="min-h-[48px] px-3.5 rounded-[12px] border border-white/20 bg-[#182640] text-[#F5EEDC] text-[15px] outline-none focus:border-[#F2B84B]"
                />
              </label>
            </div>
          </form>

          {/* Right: Live Preview & Action Buttons */}
          <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
            <span className="text-[12px] font-bold tracking-[0.16em] uppercase text-[#A9B3C7]">
              Live preview
            </span>

            <div
              style={{ transform: 'rotate(1.2deg)' }}
              className="flex flex-col items-center transition-transform"
            >
              <svg width="110" height="26" viewBox="0 0 120 28" aria-hidden="true">
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
                className="w-full rounded-[6px] p-3 flex flex-col gap-2.5 shadow-xl"
              >
                <div
                  style={{ backgroundColor: tierStyles.tint }}
                  className="h-[140px] rounded-[3px] overflow-hidden flex items-center justify-center font-heading font-extrabold text-[48px] text-[#101A2C]"
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

                <div className="font-heading font-extrabold text-[20px] text-[#101A2C] leading-[1.15] truncate">
                  {name.trim() || "Legend's name"}
                </div>

                <div className="text-[14px] text-[#2E3850] leading-[1.35] line-clamp-2 min-h-[38px]">
                  {title.trim() || 'The achievement appears here as you type it.'}
                </div>

                <div className="text-[12px] font-bold text-[#101A2C] pt-1">
                  {selectedWing?.name} · {year || '2026'} · {tier}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3 pt-4 mt-auto">
              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(true)}
                style={{ backgroundColor: '#5BD6A4', color: '#101A2C' }}
                className="flex items-center justify-center gap-2 min-h-[52px] rounded-full !text-[#101A2C] font-bold text-[16px] cursor-pointer shadow-md transition-all active:scale-95"
              >
                {loading && <Loader2 size={18} className="animate-spin" />}
                Publish plaque now
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => handleSubmit(false)}
                className="min-h-[52px] rounded-full border-[1.5px] border-[#F5EEDC]/35 hover:border-white bg-transparent text-[#F5EEDC] font-bold text-[16px] cursor-pointer transition-all active:scale-95"
              >
                Save as draft
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

