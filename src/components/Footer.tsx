import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-auto bg-[#101A2C]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-16 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[#A9B3C7]">
        <span>
          UET Lahore, Faisalabad Campus · Hall of Fame. Every nomination is reviewed before it is published.
        </span>
        <div className="flex items-center gap-6">
          <Link
            href="/admin/login"
            className="text-[#F5EEDC] hover:text-[#F2B84B] no-underline transition-colors"
          >
            Curator login
          </Link>
        </div>
      </div>
    </footer>
  );
}

