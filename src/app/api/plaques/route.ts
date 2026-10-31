import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { uploadImage } from '@/lib/cloudinary';
import { Plaque } from '@/lib/types';


function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function generateRefId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'NOM-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const wing = searchParams.get('wing');
    const tier = searchParams.get('tier');
    const year = searchParams.get('year');
    const sort = searchParams.get('sort') || 'newest';
    const status = searchParams.get('status') || 'approved';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;

    const conditions: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (status !== 'all') {
      conditions.push(`p.status = $${pIdx++}`);
      params.push(status);
    }

    if (wing && wing !== 'all') {
      conditions.push(`(p.wing_id = $${pIdx} OR w.slug = $${pIdx})`);
      params.push(wing);
      pIdx++;
    }

    if (tier && tier !== 'all' && tier !== 'All levels') {
      conditions.push(`LOWER(p.tier) = LOWER($${pIdx++})`);
      params.push(tier);
    }

    if (year && year !== 'all' && year !== 'All years') {
      conditions.push(`p.year = $${pIdx++}`);
      params.push(year);
    }

    let orderBy = 'p.approved_at DESC NULLS LAST, p.created_at DESC';
    if (sort === 'oldest') {
      orderBy = 'p.approved_at ASC NULLS LAST, p.created_at ASC';
    } else if (sort === 'highest') {
      orderBy = `
        CASE 
          WHEN LOWER(p.tier) = 'international' THEN 1
          WHEN LOWER(p.tier) = 'national' THEN 2
          ELSE 3
        END ASC, p.approved_at DESC NULLS LAST
      `;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT p.*, w.slug AS wing_slug
      FROM plaques p
      LEFT JOIN wings w ON p.wing_id = w.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${pIdx};
    `;
    params.push(limit);

    const res = await query<Plaque>(sql, params);
    return NextResponse.json(res.rows);
  } catch (error: any) {
    console.error('Error fetching plaques:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch plaques' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    let photoUrl: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      for (const [key, value] of formData.entries()) {
        if (key === 'photo' && value instanceof File && value.size > 0) {
          const buffer = Buffer.from(await value.arrayBuffer());
          try {
            photoUrl = await uploadImage(buffer);
          } catch (uploadErr) {
            console.error('Cloudinary upload error:', uploadErr);
          }
        } else if (typeof value === 'string') {
          body[key] = value;
        }
      }
    } else {
      body = await request.json();
      if (body.photo_data) {
        try {
          photoUrl = await uploadImage(body.photo_data);
        } catch (uploadErr) {
          console.error('Cloudinary base64 upload error:', uploadErr);
        }
      }
    }

    const {
      name,
      dept_batch,
      title,
      wing_id,
      wing_name: reqWingName,
      tier = 'Campus',
      year = new Date().getFullYear().toString(),
      story = '',
      proof_url = '',
      submitter_name = '',
      submitter_contact = '',
    } = body;

    if (!name || !title) {
      return NextResponse.json(
        { error: 'Name and achievement title are required' },
        { status: 400 }
      );
    }

    // Lookup wing name if not provided
    let finalWingId = wing_id || 'competitions';
    let finalWingName = reqWingName;

    if (!finalWingName && finalWingId) {
      const wingRes = await query('SELECT name FROM wings WHERE id = $1 OR slug = $1', [finalWingId]);
      if (wingRes.rows.length > 0) {
        finalWingName = wingRes.rows[0].name;
      } else {
        finalWingName = 'General';
      }
    }

    const reference_id = generateRefId();
    const initials = getInitials(name);

    const insertSql = `
      INSERT INTO plaques (
        reference_id, name, initials, dept_batch, title, wing_id, wing_name,
        tier, year, story, photo_url, proof_url, submitter_name, submitter_contact,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'pending', NOW(), NOW())
      RETURNING *;
    `;

    const res = await query<Plaque>(insertSql, [
      reference_id,
      name.trim(),
      initials,
      dept_batch?.trim() || 'General',
      title.trim(),
      finalWingId,
      finalWingName,
      tier,
      year.trim(),
      story.trim(),
      photoUrl,
      proof_url?.trim() || null,
      submitter_name?.trim() || null,
      submitter_contact?.trim() || null,
    ]);

    return NextResponse.json({
      success: true,
      reference_id,
      plaque: res.rows[0],
    });
  } catch (error: any) {
    console.error('Error submitting nomination:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to submit nomination' },
      { status: 500 }
    );
  }
}

