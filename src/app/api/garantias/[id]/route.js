import { NextResponse } from 'next/server';
import { getGarantia, updateGarantia, deleteGarantia } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { calcDataFinal } from '@/lib/warranty';

export async function GET(_req, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const g = await getGarantia(params.id);
  if (!g) return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 });
  return NextResponse.json({ garantia: g });
}

export async function PUT(request, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const existente = await getGarantia(params.id);
  if (!existente) return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 });
  let data;
  try { data = await request.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const dataEntrega = data.data_entrega || existente.data_entrega;
  const prazo = data.prazo_garantia_dias != null ? data.prazo_garantia_dias : existente.prazo_garantia_dias;
  data.data_final_garantia = calcDataFinal(dataEntrega, prazo);
  return NextResponse.json({ ok: true, garantia: await updateGarantia(params.id, data) });
}

export async function DELETE(_req, { params }) {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const ok = await deleteGarantia(params.id);
  if (!ok) return NextResponse.json({ error: 'Não encontrada.' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
