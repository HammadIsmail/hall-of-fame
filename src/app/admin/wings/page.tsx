import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import WingIcon from '@/components/WingIcon';
import { ArrowLeft, Globe, Plus } from 'lucide-react';
import { Wing } from '@/lib/types';


export default async function ManageWingsPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const res = await query<Wing & { plaque_count: string }>(`
    SELECT w.*, COUNT(p.id) AS plaque_count
    FROM wings w
    LEFT JOIN plaques p ON p.wing_id = w.id AND p.status = 'approved'
    GROUP BY w.id
    ORDER BY w.display_order ASC;
  `);

  const wings = res.rows.map(w => ({
    ...w,
    plaque_count: parseInt(w.plaque_count || '0', 10),
  }));

  return (
    <div className="flex min-h-screen bg-[#0C1424] text-[#F5EEDC] font-sans">
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
            href="/admin/add"
            className="flex items-center justify-center gap-2 min-h-[46px] rounded-full bg-[#F2B84B] hover:bg-[#FFD27A] text-[#101A2C] font-bold text-[15px] no-underline shadow-sm transition-all"
          >
            <Plus size={18} strokeWidth={2.4} />
            Add legend
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
              className="flex items-center min-h-[44px] px-3.5 rounded-[10px] bg-[#F2B84B]/15 text-[#F2B84B] no-underline"
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
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between gap-6 px-6 sm:px-8 py-5 border-b border-white/10 bg-[#101A2C]">
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-heading font-extrabold text-[26px] sm:text-[30px] leading-[1.1]">
              Campus Wings
            </h1>
            <span className="text-[13px] text-[#A9B3C7]">
              The 6 categories where campus feats and triumphs are hung.
            </span>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 min-h-[40px] px-4 rounded-full border border-white/20 text-[#F5EEDC] hover:bg-white/5 text-[14px] font-bold no-underline"
          >
            <ArrowLeft size={16} />
            Back to queue
          </Link>
        </header>

        <div className="p-6 sm:p-8 max-w-[1000px] flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {wings.map((w, idx) => (
              <div
                key={w.id}
                className="p-6 rounded-[16px] bg-[#182640] border border-white/10 flex flex-col gap-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="w-12 h-12 rounded-full bg-[#F2B84B]/15 flex items-center justify-center">
                      <WingIcon path={w.icon_path} slugOrId={w.slug} size={24} />
                    </span>
                    <div>
                      <h3 className="m-0 font-heading font-bold text-[19px] text-[#F5EEDC]">
                        {w.name}
                      </h3>
                      <span className="text-xs text-[#A9B3C7]">slug: /wing/{w.slug}</span>
                    </div>
                  </div>
                  <span className="bg-[#101A2C] border border-white/10 text-[#F2B84B] px-3 py-1 rounded-full text-xs font-bold">
                    {w.plaque_count} {w.plaque_count === 1 ? 'plaque' : 'plaques'}
                  </span>
                </div>

                <p className="m-0 text-sm text-[#A9B3C7] leading-relaxed">
                  {w.blurb}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <span className="text-[#A9B3C7]">Room #{idx + 1}</span>
                  <Link
                    href={`/wing/${w.slug}`}
                    target="_blank"
                    className="text-[#F2B84B] hover:underline"
                  >
                    View public wing page →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

