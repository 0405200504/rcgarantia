'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { computeStatus, formatDate, whatsappDigits } from '@/lib/warranty';
import StatusBadge from '@/components/StatusBadge';

const FILTRO_INICIAL = {
  cliente: '',
  whatsapp: '',
  codigo: '',
  modelo: '',
  servico: '',
  status: '',
  entregaDe: '',
  entregaAte: '',
  vencDe: '',
  vencAte: '',
};

export default function GarantiasPage() {
  const router = useRouter();
  const [garantias, setGarantias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [f, setF] = useState(FILTRO_INICIAL);
  const [aviso, setAviso] = useState('');

  async function carregar() {
    setLoading(true);
    const res = await fetch('/api/garantias');
    if (res.ok) {
      const data = await res.json();
      setGarantias(data.garantias);
    }
    setLoading(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  function set(campo, valor) {
    setF((prev) => ({ ...prev, [campo]: valor }));
  }

  const filtradas = useMemo(() => {
    return garantias
      .map((g) => ({ ...g, _s: computeStatus(g) }))
      .filter((g) => {
        if (f.cliente && !g.cliente_nome.toLowerCase().includes(f.cliente.toLowerCase())) return false;
        if (f.whatsapp && !whatsappDigits(g.cliente_whatsapp).includes(whatsappDigits(f.whatsapp))) return false;
        if (f.codigo && !g.codigo_garantia.toLowerCase().includes(f.codigo.toLowerCase())) return false;
        if (f.modelo && !g.modelo_celular.toLowerCase().includes(f.modelo.toLowerCase())) return false;
        if (f.servico && !g.servico_realizado.toLowerCase().includes(f.servico.toLowerCase())) return false;
        if (f.status && g._s.status !== f.status) return false;
        if (f.entregaDe && g.data_entrega < f.entregaDe) return false;
        if (f.entregaAte && g.data_entrega > f.entregaAte) return false;
        if (f.vencDe && g.data_final_garantia < f.vencDe) return false;
        if (f.vencAte && g.data_final_garantia > f.vencAte) return false;
        return true;
      });
  }, [garantias, f]);

  async function cancelar(g) {
    if (!confirm(`Cancelar a garantia ${g.codigo_garantia}?`)) return;
    const res = await fetch(`/api/garantias/${g.id}/cancelar`, { method: 'POST' });
    if (res.ok) {
      setAviso(`Garantia ${g.codigo_garantia} cancelada.`);
      carregar();
    }
  }

  async function excluir(g) {
    if (!confirm(`Excluir definitivamente a garantia ${g.codigo_garantia}? Esta ação não pode ser desfeita.`))
      return;
    const res = await fetch(`/api/garantias/${g.id}`, { method: 'DELETE' });
    if (res.ok) {
      setAviso(`Garantia ${g.codigo_garantia} excluída.`);
      carregar();
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Garantias</h1>
          <p className="text-sm text-slate-500">{filtradas.length} resultado(s)</p>
        </div>
        <Link href="/garantias/nova" className="btn-primary">
          ＋ Nova garantia
        </Link>
      </div>

      {aviso && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {aviso}
        </div>
      )}

      {/* Filtros */}
      <div className="card mb-6 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <input className="input" placeholder="Cliente" value={f.cliente} onChange={(e) => set('cliente', e.target.value)} />
          <input className="input" placeholder="WhatsApp" value={f.whatsapp} onChange={(e) => set('whatsapp', e.target.value)} />
          <input className="input" placeholder="Código (GAR-...)" value={f.codigo} onChange={(e) => set('codigo', e.target.value)} />
          <input className="input" placeholder="Modelo do celular" value={f.modelo} onChange={(e) => set('modelo', e.target.value)} />
          <input className="input" placeholder="Serviço realizado" value={f.servico} onChange={(e) => set('servico', e.target.value)} />
          <select className="input" value={f.status} onChange={(e) => set('status', e.target.value)}>
            <option value="">Todos os status</option>
            <option value="Ativa">Ativa</option>
            <option value="Vencendo">Vencendo</option>
            <option value="Vencida">Vencida</option>
            <option value="Cancelada">Cancelada</option>
          </select>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Entrega: de</label>
            <input type="date" className="input" value={f.entregaDe} onChange={(e) => set('entregaDe', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Entrega: até</label>
            <input type="date" className="input" value={f.entregaAte} onChange={(e) => set('entregaAte', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Vencimento: de</label>
            <input type="date" className="input" value={f.vencDe} onChange={(e) => set('vencDe', e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-400">Vencimento: até</label>
            <input type="date" className="input" value={f.vencAte} onChange={(e) => set('vencAte', e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <button className="btn-ghost" onClick={() => setF(FILTRO_INICIAL)}>
            Limpar filtros
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Carregando...</p>
          ) : filtradas.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-slate-500">Nenhuma garantia encontrada.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3 font-medium">Código</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">WhatsApp</th>
                  <th className="px-4 py-3 font-medium">Celular</th>
                  <th className="px-4 py-3 font-medium">Serviço</th>
                  <th className="px-4 py-3 font-medium">Entrega</th>
                  <th className="px-4 py-3 font-medium">Validade</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtradas.map((g) => (
                  <tr key={g.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3 font-mono text-xs text-slate-700">{g.codigo_garantia}</td>
                    <td className="px-4 py-3 text-slate-800">{g.cliente_nome}</td>
                    <td className="px-4 py-3 text-slate-600">{g.cliente_whatsapp}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {g.marca_celular} {g.modelo_celular}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{g.servico_realizado}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(g.data_entrega)}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(g.data_final_garantia)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={g._s.status} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 whitespace-nowrap text-xs">
                        <Link href={`/garantias/${g.id}`} className="font-medium text-brand-600 hover:underline">
                          Ver
                        </Link>
                        <Link href={`/garantias/${g.id}/editar`} className="text-slate-500 hover:underline">
                          Editar
                        </Link>
                        <Link href={`/garantias/${g.id}/comprovante`} className="text-slate-500 hover:underline">
                          Comprovante
                        </Link>
                        {g.status !== 'Cancelada' && (
                          <button onClick={() => cancelar(g)} className="text-amber-600 hover:underline">
                            Cancelar
                          </button>
                        )}
                        <button onClick={() => excluir(g)} className="text-red-600 hover:underline">
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
