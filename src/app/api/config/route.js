import { NextResponse } from 'next/server';
import { getConfig, updateConfig } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function GET() {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  return NextResponse.json({ config: await getConfig() });
}

export async function PUT(request) {
  if (!(await getSessionUser())) return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  let data;
  try { data = await request.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const allowed = ['nome_assistencia','logo_url','whatsapp','endereco','cnpj','termos_garantia','prazo_padrao_garantia','cor_principal','mostrar_valor_comprovante'];
  const patch = {};
  for (const k of allowed) if (k in data) patch[k] = data[k];
  if (patch.prazo_padrao_garantia != null) patch.prazo_padrao_garantia = Number(patch.prazo_padrao_garantia);
  return NextResponse.json({ ok: true, config: await updateConfig(patch) });
}
