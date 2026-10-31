import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WingClientView from './WingClientView';
import { query } from '@/lib/db';
import { Plaque, Wing } from '@/lib/types';


async function getWingData(slug: string) {
  try {
    const wingRes = await query<Wing>(
      'SELECT * FROM wings WHERE slug = $1 OR id = $1 LIMIT 1',
      [slug]
    );

    if (wingRes.rows.length === 0) {
      return null;
    }

    const wing = wingRes.rows[0];

    const plaquesRes = await query<Plaque>(
      `SELECT p.*, w.slug as wing_slug
       FROM plaques p
       LEFT JOIN wings w ON p.wing_id = w.id
       WHERE (p.wing_id = $1 OR w.slug = $2) AND p.status = 'approved'
       ORDER BY p.approved_at DESC NULLS LAST, p.created_at DESC`,
      [wing.id, wing.slug]
    );

    return {
      wing,
      plaques: plaquesRes.rows,
    };
  } catch (error) {
    console.error('Error fetching wing data:', error);
    return null;
  }
}

export default async function WingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getWingData(slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#101A2C] text-[#F5EEDC] font-sans">
      <Header />
      <WingClientView wing={data.wing} initialPlaques={data.plaques} />
      <Footer />
    </div>
  );
}

