'use client';

import Link from 'next/link';
import { buildWhatsappLink, mensagemComprovante } from '@/lib/warranty';

export default function ComprovanteToolbar({ garantia, voltarHref }) {
  function linkConsulta() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/consulta?codigo=${encodeURIComponent(garantia.codigo_garantia)}`;
  }
  function imprimir() {
    window.print();
  }
  function whatsapp() {
    const msg = mensagemComprovante(garantia, {}, linkConsulta());
    window.open(buildWhatsappLink(garantia.cliente_whatsapp, msg), '_blank');
  }

  return (
    <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
      <Link href={voltarHref} className="text-sm text-brand-600 hover:underline">
        ← Voltar
      </Link>
      <div className="flex flex-wrap gap-2">
        <button onClick={imprimir} className="btn-secondary">
          🖨 Imprimir
        </button>
        <button onClick={imprimir} className="btn-secondary">
          ⬇ Baixar PDF
        </button>
        <button onClick={whatsapp} className="btn-primary">
          Compartilhar no WhatsApp
        </button>
      </div>
    </div>
  );
}
