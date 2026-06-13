import crypto from 'crypto';
import { cookies } from 'next/headers';
import { getUserById } from './db';

const SECRET = process.env.SESSION_SECRET || 'rc-garantia-segredo-local-dev-2026';
export const COOKIE_NAME = 'rc_session';

function sign(userId) {
  const sig = crypto.createHmac('sha256', SECRET).update(String(userId)).digest('hex');
  return `${userId}.${sig}`;
}

export function createSessionToken(userId) {
  return sign(userId);
}

function verifyToken(token) {
  if (!token || !token.includes('.')) return null;
  const [userId, sig] = token.split('.');
  const expected = crypto.createHmac('sha256', SECRET).update(String(userId)).digest('hex');
  const a = Buffer.from(sig.padEnd(64, '0').slice(0, 64), 'hex');
  const b = Buffer.from(expected, 'hex');
  try {
    if (!crypto.timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return userId;
}

export async function getSessionUser() {
  const token = cookies().get(COOKIE_NAME)?.value;
  const userId = verifyToken(token);
  if (!userId) return null;
  const user = await getUserById(userId);
  if (!user) return null;
  return { id: user.id, nome: user.nome, email: user.email };
}
