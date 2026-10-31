'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify email and password.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#101A2C] text-[#F5EEDC] font-sans flex flex-col lg:flex-row">
      {/* Left Column: Visual Showcase */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 sm:p-16 bg-[radial-gradient(ellipse_70%_70%_at_50%_0%,rgba(242,184,75,0.28),rgba(16,26,44,0)_72%)]">
        <div
          style={{ transform: 'rotate(-2deg)' }}
          className="flex flex-col items-center"
        >
          <svg width="150" height="38" viewBox="0 0 120 28" aria-hidden="true">
            <circle cx="60" cy="5" r="4" fill="#F2B84B" />
            <path
              d="M60 5 L14 28 M60 5 L106 28"
              stroke="#6E7A94"
              strokeWidth="1.5"
              fill="none"
            />
          </svg>

          <div className="w-[280px] sm:w-[320px] bg-[#F5EEDC] border-[8px] border-[#F2B84B] rounded-[8px] p-6 flex flex-col items-center gap-3.5 shadow-[0_28px_60px_rgba(0,0,0,0.55)]">
            <svg
              width="68"
              height="68"
              viewBox="0 0 72 72"
              aria-hidden="true"
            >
              <circle
                cx="36"
                cy="36"
                r="33"
                fill="none"
                stroke="#101A2C"
                strokeWidth="2.5"
              />
              <polygon
                points="36,14 41.3,28.7 56.9,29.2 44.6,38.8 48.9,53.8 36,45 23.1,53.8 27.4,38.8 15.1,29.2 30.7,28.7"
                fill="#101A2C"
              />
            </svg>
            <div className="font-heading font-extrabold text-[24px] sm:text-[26px] text-[#101A2C] text-center leading-[1.1]">
              Curator&apos;s Desk
            </div>
            <div className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#2E3850] text-center">
              UET Lahore · Faisalabad Campus
            </div>
          </div>
        </div>

        <p className="m-0 max-w-[340px] text-center text-[15px] leading-[1.5] text-[#A9B3C7]">
          Every nomination passes through this desk before it is hung on the wall.
        </p>
      </div>

      {/* Right Column: Sign In Form */}
      <div className="w-full lg:w-[540px] xl:w-[580px] bg-[#182640] flex flex-col justify-center px-8 sm:px-16 py-12 sm:py-16 gap-7 border-l border-white/5">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 font-heading font-extrabold text-[36px] sm:text-[44px] leading-[1.05] tracking-[-0.02em] text-[#F5EEDC]">
            Curator sign in
          </h1>
          <p className="m-0 text-[15px] leading-[1.5] text-[#A9B3C7]">
            Only the Curator needs an account. Visitors never have to sign in.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-[12px] bg-red-950/60 border border-red-500/40 text-red-200 text-sm">
            <AlertCircle size={18} className="flex-shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-[14px] font-bold">
            <span>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="curator@example.com"
              className="min-h-[52px] px-4 rounded-[12px] border border-white/20 bg-[#101A2C] text-[#F5EEDC] text-[16px] outline-none focus:border-[#F2B84B] transition-colors"
            />
          </label>

          <label className="flex flex-col gap-2 text-[14px] font-bold">
            <span>Password</span>
            <div className="flex items-center rounded-[12px] border border-white/20 bg-[#101A2C] overflow-hidden focus-within:border-[#F2B84B]">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Your password"
                className="flex-1 min-w-0 min-h-[52px] px-4 bg-transparent border-0 text-[#F5EEDC] text-[16px] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="flex-shrink-0 w-12 h-12 flex items-center justify-center text-[#A9B3C7] hover:text-[#F5EEDC]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </label>


          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
            className="btn-gold flex items-center justify-center min-h-[54px] rounded-full !text-[#101A2C] font-bold text-[17px] shadow-md transition-all cursor-pointer mt-2 active:scale-95"
          >
            {loading && <Loader2 size={20} className="animate-spin mr-2" />}
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="flex flex-col gap-3 text-[14px] text-[#A9B3C7] pt-2">
          <span>Forgot your password? Ask the site owner to reset it.</span>
          <Link
            href="/"
            className="text-[#F5EEDC] hover:text-[#F2B84B] font-bold no-underline transition-colors"
          >
            ← Back to the Hall
          </Link>
        </div>
      </div>
    </div>
  );
}

