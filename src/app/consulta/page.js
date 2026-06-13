'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatDate } from '@/lib/warranty';
import { STATUS_BADGE } from '@/lib/warranty';

function Badge({ status }) {
  return <span className={`badge ${STATUS_BADGE[status] || STATUS_BADGE.Cancelada}`}>{status}</span>;
}

function ConsultaInner() {
  const params = useSearchParams();
  const [codigo, setCodigo] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  async function consultar(codigoArg, whatsappArg) {
    setErro('');
    setLoading(true);
    setBuscou(true);
    try {
      const res = await fetch('/api/consulta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo: codigoArg ?? codigo, whatsapp: whatsappArg ?? whatsapp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResultado(null);
        setErro(data.error || 'Nenhuma garantia encontrada.');
        return;
      }
      setResultado(data);
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  // Auto-consulta se vier ?codigo= na URL
  useEffect(() => {
    const c = params.get('codigo');
    const w = params.get('whatsapp');
    if (c) setCodigo(c);
    if (w) setWhatsapp(w);
    if (c || w) consultar(c || '', w || '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e) {
    e.preventDefault();
    consultar();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-brand-50 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white shadow-card">
            RC
          </div>
          <h1 className="text-2xl font-semibold text-slate-900">Consultar garantia</h1>
          <p className="mt-1 text-sm text-slate-500">
            Informe o código da garantia ou o WhatsApp cadastrado.
          </p>
        </div>

        <form onSubmit={submit} className="card p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Código da garantia</label>
              <input className="input" placeholder="GAR-2026-0001" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" placeholder="(00) 00000-0000" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4 w-full" disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
        </form>

        {erro && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {erro}
          </div>
        )}

        {resultado && (
          <div className="mt-6 space-y-4">
            {resultado.resultados.map((g) => (
              <div key={g.codigo_garantia} className="card p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-sm font-semibold text-slate-800">{g.codigo_garantia}</span>
                  <Badge status={g.status} />
                </div>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
                  <div>
                    <dt className="text-slate-400">Cliente</dt>
                    <dd className="font-medium text-slate-800">{g.cliente_nome}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Aparelho</dt>
                    <dd className="font-medium text-slate-800">
                      {g.marca_celular} {g.modelo_celular}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Serviço realizado</dt>
                    <dd className="font-medium text-slate-800">{g.servico_realizado}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Prazo</dt>
                    <dd className="font-medium text-slate-800">{g.prazo_garantia_dias} dias</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Data de entrega</dt>
                    <dd className="font-medium text-slate-800">{formatDate(g.data_entrega)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Garantia válida até</dt>
                    <dd className="font-medium text-slate-800">{formatDate(g.data_final_garantia)}</dd>
                  </div>
                </dl>
                {resultado.termos_garantia && (
                  <div className="mt-5 rounded-xl bg-slate-50 p-4">
                    <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Termos da garantia
                    </h3>
                    <p className="text-xs leading-relaxed text-slate-600">{resultado.termos_garantia}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {buscou && !loading && !erro && resultado && resultado.resultados.length === 0 && (
          <p className="mt-4 text-center text-sm text-slate-500">Nenhuma garantia encontrada.</p>
        )}

        <p className="mt-8 text-center text-sm text-slate-400">
          <Link href="/login" className="hover:text-brand-600">
            Acesso da assistência
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ConsultaPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-slate-500">Carregando...</div>}>
      <ConsultaInner />
    </Suspense>
  );
}
