import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminDashboardClient from './AdminDashboardClient';
import { Plaque, Wing } from '@/lib/types';


async function getAdminData() {
  const [pendingRes, approvedRes, rejectedRes, wingsRes] = await Promise.all([
    query<Plaque>('SELECT * FROM plaques WHERE status = $1 ORDER BY created_at DESC', ['pending']),
    query<Plaque>('SELECT * FROM plaques WHERE status = $1 ORDER BY approved_at DESC, updated_at DESC', ['approved']),
    query<Plaque>('SELECT * FROM plaques WHERE status = $1 ORDER BY updated_at DESC', ['rejected']),
    query<Wing>('SELECT * FROM wings ORDER BY display_order ASC'),
  ]);

  return {
    pending: pendingRes.rows,
    approved: approvedRes.rows,
    rejected: rejectedRes.rows,
    wings: wingsRes.rows,
  };
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const data = await getAdminData();

  return (
    <AdminDashboardClient
      initialPending={data.pending}
      initialApproved={data.approved}
      initialRejected={data.rejected}
      wings={data.wings}
      user={session}
    />
  );
}

