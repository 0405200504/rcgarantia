import { NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword } from '@/lib/db';
import { createSessionToken, COOKIE_NAME } from '@/lib/session';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const { email, senha } = body || {};
  if (!email || !senha) return NextResponse.json({ error: 'Informe e-mail e senha.' }, { status: 400 });

  const user = await getUserByEmail(email);
  if (!user || !verifyPassword(senha, user.senha_hash)) {
    return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  }
  const token = createSessionToken(user.id);
  const res = NextResponse.json({ ok: true, user: { nome: user.nome, email: user.email } });
  res.cookies.set(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 });
  return res;
}
