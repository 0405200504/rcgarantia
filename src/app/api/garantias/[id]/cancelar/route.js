import { NextResponse } from 'next/server';
import { getGarantia, setStatus } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function POST(_req, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const g = await getGarantia(params.id);
  if (!g) return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 });
  return NextResponse.json({ ok: true, garantia: await setStatus(params.id, 'Cancelada') });
}
