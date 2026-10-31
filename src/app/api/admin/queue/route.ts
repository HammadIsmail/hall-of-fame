import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Plaque, Wing } from '@/lib/types';


export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [pendingRes, approvedRes, rejectedRes, wingsRes] = await Promise.all([
      query<Plaque>('SELECT * FROM plaques WHERE status = $1 ORDER BY created_at DESC', ['pending']),
      query<Plaque>('SELECT * FROM plaques WHERE status = $1 ORDER BY approved_at DESC, updated_at DESC', ['approved']),
      query<Plaque>('SELECT * FROM plaques WHERE status = $1 ORDER BY updated_at DESC', ['rejected']),
      query<Wing>('SELECT * FROM wings ORDER BY display_order ASC'),
    ]);

    return NextResponse.json({
      pending: pendingRes.rows,
      approved: approvedRes.rows,
      rejected: rejectedRes.rows,
      stats: {
        pending: pendingRes.rowCount || 0,
        approved: approvedRes.rowCount || 0,
        rejected: rejectedRes.rowCount || 0,
      },
      wings: wingsRes.rows,
    });
  } catch (error: any) {
    console.error('Error in admin queue:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch admin queue' },
      { status: 500 }
    );
  }
}

