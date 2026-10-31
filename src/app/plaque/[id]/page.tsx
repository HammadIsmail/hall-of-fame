import React from 'react';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PlaqueDetailClient from './PlaqueDetailClient';
import { query } from '@/lib/db';
import { Plaque } from '@/lib/types';


async function getPlaqueData(idOrRef: string) {
  try {
    const isNumeric = /^\d+$/.test(idOrRef);
    const sql = `
      SELECT p.*, w.slug as wing_slug
      FROM plaques p
      LEFT JOIN wings w ON p.wing_id = w.id
      WHERE ${isNumeric ? 'p.id = $1' : 'p.reference_id = $1'}
      LIMIT 1;
    `;
    const res = await query<Plaque & { wing_slug: string }>(sql, [
      isNumeric ? parseInt(idOrRef, 10) : idOrRef,
    ]);

    if (res.rows.length === 0) return null;
    const plaque = res.rows[0];

    const relatedSql = `
      SELECT p.*, w.slug as wing_slug
      FROM plaques p
      LEFT JOIN wings w ON p.wing_id = w.id
      WHERE p.wing_id = $1 AND p.id != $2 AND p.status = 'approved'
      ORDER BY p.approved_at DESC NULLS LAST
      LIMIT 3;
    `;
    const moreRes = await query<Plaque>(relatedSql, [plaque.wing_id, plaque.id]);

    return {
      plaque,
      more: moreRes.rows,
    };
  } catch (error) {
    console.error('Error fetching plaque:', error);
    return null;
  }
}

export default async function PlaqueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getPlaqueData(id);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#101A2C] text-[#F5EEDC] font-sans">
      <Header />
      <PlaqueDetailClient plaque={data.plaque} more={data.more} />
      <Footer />
    </div>
  );
}

