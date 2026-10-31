import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Plaque } from '@/lib/types';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const isNumeric = /^\d+$/.test(id);

    const condition = isNumeric ? 'p.id = $1' : 'p.reference_id = $1';
    const sql = `
      SELECT p.*, w.slug AS wing_slug
      FROM plaques p
      LEFT JOIN wings w ON p.wing_id = w.id
      WHERE ${condition}
      LIMIT 1;
    `;

    const res = await query<Plaque & { wing_slug: string }>(sql, [isNumeric ? parseInt(id, 10) : id]);

    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Plaque not found' }, { status: 404 });
    }

    const plaque = res.rows[0];

    // Fetch related plaques from the same wing (excluding current one)
    const relatedSql = `
      SELECT p.*, w.slug AS wing_slug
      FROM plaques p
      LEFT JOIN wings w ON p.wing_id = w.id
      WHERE p.wing_id = $1 AND p.id != $2 AND p.status = 'approved'
      ORDER BY p.approved_at DESC NULLS LAST
      LIMIT 3;
    `;
    const relatedRes = await query<Plaque>(relatedSql, [plaque.wing_id, plaque.id]);

    return NextResponse.json({
      plaque,
      more: relatedRes.rows,
    });
  } catch (error: any) {
    console.error('Error fetching plaque:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch plaque' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const allowedFields = [
      'name',
      'dept_batch',
      'title',
      'wing_id',
      'wing_name',
      'tier',
      'year',
      'story',
      'photo_url',
      'proof_url',
      'status',
      'rejection_note',
    ];

    const updates: string[] = [];
    const values: any[] = [];
    let pIdx = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${pIdx++}`);
        values.push(body[field]);
      }
    }

    if (body.status === 'approved') {
      updates.push(`approved_at = NOW()`);
    }

    if (body.name) {
      const parts = body.name.trim().split(/\s+/);
      const initials = parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      updates.push(`initials = $${pIdx++}`);
      values.push(initials);
    }

    updates.push(`updated_at = NOW()`);

    if (updates.length === 1) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    values.push(parseInt(id, 10));
    const sql = `
      UPDATE plaques
      SET ${updates.join(', ')}
      WHERE id = $${pIdx}
      RETURNING *;
    `;

    const res = await query<Plaque>(sql, values);
    if (res.rows.length === 0) {
      return NextResponse.json({ error: 'Plaque not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, plaque: res.rows[0] });
  } catch (error: any) {
    console.error('Error updating plaque:', error);
    return NextResponse.json({ error: error.message || 'Failed to update plaque' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await query('DELETE FROM plaques WHERE id = $1', [parseInt(id, 10)]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting plaque:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete plaque' }, { status: 500 });
  }
}

