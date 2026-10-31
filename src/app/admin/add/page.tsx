import React from 'react';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { query } from '@/lib/db';
import AdminAddLegendClient from './AdminAddLegendClient';
import { Wing } from '@/lib/types';


export default async function AdminAddLegendPage() {
  const session = await getSession();
  if (!session) {
    redirect('/admin/login');
  }

  const wingsRes = await query<Wing>('SELECT * FROM wings ORDER BY display_order ASC');

  return <AdminAddLegendClient wings={wingsRes.rows} user={session} />;
}

