import React from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlaqueCard from '@/components/PlaqueCard';
import WingIcon from '@/components/WingIcon';
import { query } from '@/lib/db';
import { Plaque, Wing } from '@/lib/types';


async function getHomeData() {
  try {
    const [wingsRes, plaquesRes] = await Promise.all([
      query<Wing & { plaque_count: string }>(`
        SELECT w.*, COUNT(p.id) AS plaque_count
        FROM wings w
        LEFT JOIN plaques p ON p.wing_id = w.id AND p.status = 'approved'
        GROUP BY w.id
        ORDER BY w.display_order ASC;
      `),
      query<Plaque & { wing_slug: string }>(`
        SELECT p.*, w.slug as wing_slug
        FROM plaques p
        LEFT JOIN wings w ON p.wing_id = w.id
        WHERE p.status = 'approved'
        ORDER BY p.approved_at DESC NULLS LAST, p.created_at DESC
        LIMIT 8;
      `),
    ]);

    return {
      wings: wingsRes.rows.map(w => ({
        ...w,
        plaque_count: parseInt(w.plaque_count || '0', 10),
      })),
      latest: plaquesRes.rows,
    };
  } catch (error) {
    console.error('Failed to load home data from DB:', error);
    return {
      wings: [],
      latest: [],
    };
  }
}

export default async function HomePage() {
  const { wings, latest } = await getHomeData();

  // Hero showcase items (staggered tilted cards)
  const heroPlaques = latest.slice(0, 3);
  const heroTilts = [-5, 2, 6];
  const heroDeltas = [36, 0, 48];

  return (
    <div className="min-h-screen flex flex-col bg-[#101A2C] text-[#F5EEDC] font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[radial-gradient(ellipse_60%_90%_at_78%_0%,rgba(242,184,75,0.24),rgba(16,26,44,0)_70%)]">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 py-16 lg:py-24 flex flex-wrap items-center gap-12 lg:gap-16">
          {/* Hero text */}
          <div className="flex-1 min-w-[300px] sm:min-w-[440px] flex flex-col gap-6 lg:gap-7 z-10">
            <span className="text-[12px] sm:text-[13px] font-bold tracking-[0.16em] uppercase text-[#F2B84B]">
              The campus wall of honour
            </span>
            <h1 className="m-0 font-heading font-extrabold text-[44px] sm:text-[62px] lg:text-[74px] leading-[1.02] tracking-[-0.02em] text-[#F5EEDC]">
              Where this campus keeps its legends.
            </h1>
            <p className="m-0 text-[18px] sm:text-[20px] leading-[1.5] text-[#A9B3C7] max-w-[520px]">
              Wins, firsts and feats by students and alumni of UET Lahore, Faisalabad Campus. Anyone can nominate. No account, no sign-up.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                href="#wings"
                style={{ backgroundColor: '#F2B84B', color: '#101A2C' }}
                className="btn-gold inline-flex items-center justify-center !text-[#101A2C] px-7 py-3.5 rounded-full font-bold text-[16px] no-underline transition-all shadow-lg active:scale-95"
              >
                Walk the Hall
              </a>
              <Link
                href="/nominate"
                className="inline-flex items-center justify-center border-[1.5px] border-[#F5EEDC]/45 hover:border-[#F5EEDC] text-[#F5EEDC] hover:bg-white/5 px-7 py-3.5 rounded-full font-bold text-[16px] no-underline transition-all active:scale-95"
              >
                Nominate a legend
              </Link>
            </div>
          </div>

          {/* Hero hanging plaques showcase */}
          <div className="flex-1 min-w-[300px] flex justify-center items-start pt-3 overflow-visible">
            <div className="flex items-start justify-center gap-2 sm:-space-x-8">
              {heroPlaques.map((p, idx) => (
                <div
                  key={p.id}
                  style={{
                    transform: `rotate(${heroTilts[idx % 3]}deg)`,
                    marginTop: `${heroDeltas[idx % 3]}px`,
                  }}
                  className="w-[160px] sm:w-[200px] lg:w-[220px] flex-shrink-0 transition-transform hover:z-20 hover:scale-105"
                >
                  <PlaqueCard plaque={p} compact tilt={0} wireWidth={100} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how" className="bg-[#182640] border-y border-white/5">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20 flex flex-col gap-10">
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] sm:text-[13px] font-bold tracking-[0.16em] uppercase text-[#F2B84B]">
              How it works
            </span>
            <h2 className="m-0 font-heading font-extrabold text-[34px] sm:text-[44px] leading-[1.1] text-[#F5EEDC]">
              Three steps from feat to frame.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col gap-3.5 p-7 rounded-[16px] bg-[#101A2C] border border-white/10 hover:border-white/20 transition-all">
              <span className="w-11 h-11 rounded-full bg-[#F2B84B] text-[#101A2C] flex items-center justify-center font-heading font-extrabold text-[20px]">
                1
              </span>
              <h3 className="m-0 font-heading font-extrabold text-[22px] sm:text-[24px] text-[#F5EEDC]">
                Nominate
              </h3>
              <p className="m-0 text-[15px] sm:text-[16px] leading-[1.5] text-[#A9B3C7]">
                Fill a short form about the achievement and who did it. No account needed.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 p-7 rounded-[16px] bg-[#101A2C] border border-white/10 hover:border-white/20 transition-all">
              <span className="w-11 h-11 rounded-full bg-[#F2B84B] text-[#101A2C] flex items-center justify-center font-heading font-extrabold text-[20px]">
                2
              </span>
              <h3 className="m-0 font-heading font-extrabold text-[22px] sm:text-[24px] text-[#F5EEDC]">
                The Curator reviews
              </h3>
              <p className="m-0 text-[15px] sm:text-[16px] leading-[1.5] text-[#A9B3C7]">
                An admin checks every nomination before anything goes public.
              </p>
            </div>

            <div className="flex flex-col gap-3.5 p-7 rounded-[16px] bg-[#101A2C] border border-white/10 hover:border-white/20 transition-all">
              <span className="w-11 h-11 rounded-full bg-[#F2B84B] text-[#101A2C] flex items-center justify-center font-heading font-extrabold text-[20px]">
                3
              </span>
              <h3 className="m-0 font-heading font-extrabold text-[22px] sm:text-[24px] text-[#F5EEDC]">
                Hung on the wall
              </h3>
              <p className="m-0 text-[15px] sm:text-[16px] leading-[1.5] text-[#A9B3C7]">
                Approved plaques appear in the Hall for everyone to see, no login required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wings Section */}
      <section id="wings" className="scroll-mt-16">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-20 flex flex-col gap-10">
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] sm:text-[13px] font-bold tracking-[0.16em] uppercase text-[#F2B84B]">
              Choose a wing
            </span>
            <h2 className="m-0 font-heading font-extrabold text-[34px] sm:text-[44px] leading-[1.1] text-[#F5EEDC]">
              Every kind of greatness has a room.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wings.map(w => (
              <Link
                key={w.id}
                href={`/wing/${w.slug}`}
                className="group flex items-center gap-5 p-6 sm:p-7 rounded-[16px] bg-[#182640] border border-white/10 hover:border-[#F2B84B]/50 hover:bg-[#1c2c49] text-[#F5EEDC] no-underline transition-all shadow-sm hover:shadow-md"
              >
                <span className="flex-shrink-0 w-14 h-14 rounded-full bg-[#F2B84B]/15 flex items-center justify-center group-hover:bg-[#F2B84B]/25 transition-colors">
                  <WingIcon path={w.icon_path} slugOrId={w.slug} size={28} />
                </span>
                <span className="flex flex-col gap-1 min-w-0">
                  <span className="font-heading font-extrabold text-[20px] sm:text-[22px] text-[#F5EEDC] group-hover:text-[#F2B84B] transition-colors truncate">
                    {w.name}
                  </span>
                  <span className="text-[13px] sm:text-[14px] leading-[1.4] text-[#A9B3C7] line-clamp-2">
                    {w.blurb}
                  </span>
                  <span className="text-[11px] font-bold text-[#F2B84B] pt-1 uppercase tracking-wider">
                    {w.plaque_count} {w.plaque_count === 1 ? 'plaque' : 'plaques'} hung
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Freshly Hung Section */}
      <section id="latest" className="bg-[#182640] border-t border-white/5 scroll-mt-16">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16 py-16 sm:py-24 flex flex-col gap-12">
          <div className="flex flex-col gap-2.5">
            <span className="text-[12px] sm:text-[13px] font-bold tracking-[0.16em] uppercase text-[#F2B84B]">
              Freshly hung
            </span>
            <h2 className="m-0 font-heading font-extrabold text-[34px] sm:text-[44px] leading-[1.1] text-[#F5EEDC]">
              The newest plaques on the wall.
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6 lg:gap-8">
            {latest.map((p, idx) => {
              const tilts = [-1.2, 1, -0.8, 1.3, -1, 1.2, -0.6, 0.9];
              return (
                <div key={p.id} className="flex justify-center">
                  <div className="w-full max-w-[280px]">
                    <PlaqueCard plaque={p} tilt={tilts[idx % tilts.length]} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to action Banner */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-16">
          <div className="bg-[#F2B84B] text-[#101A2C] rounded-[24px] p-8 sm:p-14 flex flex-wrap items-center justify-between gap-8 shadow-xl">
            <h2 className="m-0 flex-1 min-w-[280px] sm:min-w-[420px] font-heading font-extrabold text-[32px] sm:text-[44px] leading-[1.1]">
              Know someone who pulled off something remarkable?
            </h2>
            <Link
              href="/nominate"
              style={{ backgroundColor: '#101A2C', color: '#F5EEDC' }}
              className="btn-dark inline-flex items-center justify-center !text-[#F5EEDC] px-8 py-4 rounded-full font-bold text-[17px] no-underline transition-all shadow-md active:scale-95"
            >
              Hang their plaque
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
