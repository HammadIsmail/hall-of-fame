import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { query } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'uet-faisalabad-hall-of-fame-secret-key-2026';
const COOKIE_NAME = 'hof_curator_session';

export interface CuratorSession {
  id: number;
  email: string;
  name: string;
}

export function signToken(payload: CuratorSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): CuratorSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as CuratorSession;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<CuratorSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function requireAuth(): Promise<CuratorSession> {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
}

