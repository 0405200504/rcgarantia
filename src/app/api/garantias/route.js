import { NextResponse } from 'next/server';
import { listGarantias, createGarantia } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { calcDataFinal } from '@/lib/warranty';

function validar(data) {
  const campos = { cliente_nome:'Nome do cliente', cliente_whatsapp:'WhatsApp', marca_celular:'Marca', modelo_celular:'Modelo', servico_realizado:'Serviço', data_entrega:'Data de entrega', prazo_garantia_dias:'Prazo de garantia' };
  const erros = Object.entries(campos).filter(([k]) => !data[k] || String(data[k]).trim() === '').map(([,v]) => `${v} é obrigatório.`);
  if (data.prazo_garantia_dias && Number(data.prazo_garantia_dias) <= 0) erros.push('Prazo deve ser maior que zero.');
  return erros;
}

export async function GET() {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  return NextResponse.json({ garantias: await listGarantias() });
}

export async function POST(request) {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  let data;
  try { data = await request.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const erros = validar(data);
  if (erros.length) return NextResponse.json({ error: erros.join(' ') }, { status: 422 });
  data.data_final_garantia = calcDataFinal(data.data_entrega, data.prazo_garantia_dias);
  return NextResponse.json({ ok: true, garantia: await createGarantia(data) }, { status: 201 });
}
