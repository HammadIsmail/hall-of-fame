'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#101A2C]/90 backdrop-blur-md border-b border-white/10 transition-colors">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-16 py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 text-[#F5EEDC] hover:opacity-95 no-underline group"
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 72 72"
            aria-hidden="true"
            className="flex-shrink-0 transition-transform group-hover:scale-105"
          >
            <circle
              cx="36"
              cy="36"
              r="33"
              fill="none"
              stroke="#F2B84B"
              strokeWidth="3"
            />
            <polygon
              points="36,14 41.3,28.7 56.9,29.2 44.6,38.8 48.9,53.8 36,45 23.1,53.8 27.4,38.8 15.1,29.2 30.7,28.7"
              fill="#F2B84B"
            />
          </svg>
          <span className="flex flex-col leading-[1.15]">
            <span className="font-heading font-extrabold text-[19px] sm:text-[20px] text-[#F5EEDC]">
              Hall of Fame
            </span>
            <span className="text-[10px] sm:text-[11px] text-[#A9B3C7] tracking-[0.1em] uppercase font-medium">
              UET Lahore · Faisalabad Campus
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8 text-[15px] font-medium text-[#F5EEDC]">
          <Link
            href="/#wings"
            className="text-[#F5EEDC] hover:text-[#F2B84B] no-underline transition-colors"
          >
            Wings
          </Link>
          <Link
            href="/#latest"
            className="text-[#F5EEDC] hover:text-[#F2B84B] no-underline transition-colors"
          >
            Freshly hung
          </Link>
          <Link
            href="/#how"
            className="text-[#F5EEDC] hover:text-[#F2B84B] no-underline transition-colors"
          >
            How it works
          </Link>
        </nav>

        {/* Desktop Action */}
        <div className="hidden sm:flex items-center gap-4">
          <Link
            href="/nominate"
            style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
            className="btn-gold inline-flex items-center justify-center !text-[#101A2C] px-6 py-2.5 rounded-full font-bold text-[15px] no-underline transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            Nominate a legend
          </Link>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href="/nominate"
            style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
            className="btn-gold !text-[#101A2C] px-3.5 py-1.5 rounded-full font-bold text-[13px] no-underline"
          >
            Nominate
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-[#F5EEDC] rounded-lg hover:bg-[#182640]"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#101A2C] px-6 py-4 flex flex-col gap-4 text-[16px] font-medium animate-in slide-in-from-top-2">
          <Link
            href="/#wings"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#F5EEDC] hover:text-[#F2B84B] py-2 no-underline"
          >
            Wings
          </Link>
          <Link
            href="/#latest"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#F5EEDC] hover:text-[#F2B84B] py-2 no-underline"
          >
            Freshly hung
          </Link>
          <Link
            href="/#how"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#F5EEDC] hover:text-[#F2B84B] py-2 no-underline"
          >
            How it works
          </Link>
          <Link
            href="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="text-[#A9B3C7] hover:text-white py-2 no-underline text-sm border-t border-white/10 pt-3"
          >
            Curator desk
          </Link>
        </div>
      )}
    </header>
  );
}

