import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Wing } from '@/lib/types';


export async function GET() {
  try {
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

    return NextResponse.json(wings);
  } catch (error: any) {
    console.error('Error fetching wings:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch wings' }, { status: 500 });
  }
}

