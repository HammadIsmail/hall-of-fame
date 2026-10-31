import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getSession } from '@/lib/auth';
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
  let ref = 'LEG-';
  for (let i = 0; i < 6; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      wing_id = 'competitions',
      wing_name,
      tier = 'Campus',
      year = new Date().getFullYear().toString(),
      story = '',
      proof_url = '',
      publish_now = true,
    } = body;

    if (!name || !title) {
      return NextResponse.json(
        { error: 'Name and achievement title are required' },
        { status: 400 }
      );
    }

    let finalWingName = wing_name;
    if (!finalWingName && wing_id) {
      const wingRes = await query('SELECT name FROM wings WHERE id = $1 OR slug = $1', [wing_id]);
      if (wingRes.rows.length > 0) {
        finalWingName = wingRes.rows[0].name;
      } else {
        finalWingName = 'General';
      }
    }

    const status = publish_now === 'false' || publish_now === false ? 'pending' : 'approved';
    const approved_at = status === 'approved' ? new Date() : null;
    const reference_id = generateRefId();
    const initials = getInitials(name);

    const insertSql = `
      INSERT INTO plaques (
        reference_id, name, initials, dept_batch, title, wing_id, wing_name,
        tier, year, story, photo_url, proof_url, submitter_name, submitter_contact,
        status, approved_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
      RETURNING *;
    `;

    const res = await query<Plaque>(insertSql, [
      reference_id,
      name.trim(),
      initials,
      dept_batch?.trim() || 'General',
      title.trim(),
      wing_id,
      finalWingName,
      tier,
      year.trim(),
      story.trim(),
      photoUrl,
      proof_url?.trim() || null,
      session.name || 'Curator',
      session.email,
      status,
      approved_at,
    ]);

    return NextResponse.json({
      success: true,
      reference_id,
      plaque: res.rows[0],
    });
  } catch (error: any) {
    console.error('Error adding legend:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to add legend' },
      { status: 500 }
    );
  }
}

