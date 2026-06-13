import { NextResponse } from 'next/server';
import { listGarantias, getConfig } from '@/lib/db';
import { computeStatus, whatsappDigits } from '@/lib/warranty';

export async function POST(request) {
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const codigo = (body.codigo || '').trim();
  const whatsapp = (body.whatsapp || '').trim();
  if (!codigo && !whatsapp) return NextResponse.json({ error: 'Informe o código ou WhatsApp.' }, { status: 400 });

  const [garantias, config] = await Promise.all([listGarantias(), getConfig()]);

  let encontradas = garantias;
  if (codigo) encontradas = encontradas.filter(g => g.codigo_garantia.toLowerCase() === codigo.toLowerCase());
  if (whatsapp) {
    const alvo = whatsappDigits(whatsapp);
    encontradas = encontradas.filter(g => whatsappDigits(g.cliente_whatsapp) === alvo);
  }

  if (!encontradas.length) return NextResponse.json({ error: 'Nenhuma garantia encontrada.' }, { status: 404 });

  const resultados = encontradas.sort((a, b) => a.criado_em < b.criado_em ? 1 : -1).map(g => ({
    codigo_garantia: g.codigo_garantia, cliente_nome: g.cliente_nome,
    marca_celular: g.marca_celular, modelo_celular: g.modelo_celular,
    servico_realizado: g.servico_realizado, data_entrega: g.data_entrega,
    data_final_garantia: g.data_final_garantia, prazo_garantia_dias: g.prazo_garantia_dias,
    status: computeStatus(g).status,
  }));

  return NextResponse.json({ resultados, termos_garantia: config.termos_garantia, nome_assistencia: config.nome_assistencia });
}
