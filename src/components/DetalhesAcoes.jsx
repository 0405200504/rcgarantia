'use client';

import { useState } from 'react';
import Link from 'next/link';
import { buildWhatsappLink, mensagemComprovante } from '@/lib/warranty';

export default function DetalhesAcoes({ garantia, id }) {
  const [copiado, setCopiado] = useState(false);

  function linkConsulta() {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}/consulta?codigo=${encodeURIComponent(garantia.codigo_garantia)}`;
  }

  async function copiarLink() {
    try {
      await navigator.clipboard.writeText(linkConsulta());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt('Copie o link da garantia:', linkConsulta());
    }
  }

  function enviarWhatsapp() {
    const msg = mensagemComprovante(garantia, {}, linkConsulta());
    window.open(buildWhatsappLink(garantia.cliente_whatsapp, msg), '_blank');
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href={`/garantias/${id}/editar`} className="btn-secondary">
        ✎ Editar
      </Link>
      <Link href={`/garantias/${id}/comprovante`} className="btn-secondary">
        🖨 Imprimir / PDF
      </Link>
      <button onClick={copiarLink} className="btn-secondary">
        {copiado ? '✔ Link copiado' : '🔗 Copiar link'}
      </button>
      <button onClick={enviarWhatsapp} className="btn-primary">
        Enviar por WhatsApp
      </button>
    </div>
  );
}
