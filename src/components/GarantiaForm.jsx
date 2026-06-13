'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { calcDataFinal, formatDate } from '@/lib/warranty';

const VAZIO = {
  cliente_nome: '',
  cliente_whatsapp: '',
  marca_celular: '',
  modelo_celular: '',
  imei: '',
  servico_realizado: '',
  descricao_servico: '',
  data_entrega: '',
  prazo_garantia_dias: '',
  valor_servico: '',
  observacoes_internas: '',
};

export default function GarantiaForm({ inicial, garantiaId }) {
  const router = useRouter();
  const edicao = Boolean(garantiaId);
  const [form, setForm] = useState({ ...VAZIO, ...(inicial || {}) });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Preenche prazo padrão a partir das configurações (apenas no cadastro)
  useEffect(() => {
    if (edicao) return;
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => {
        setForm((prev) => ({
          ...prev,
          prazo_garantia_dias: prev.prazo_garantia_dias || d.config?.prazo_padrao_garantia || 90,
          data_entrega: prev.data_entrega || new Date().toISOString().slice(0, 10),
        }));
      })
      .catch(() => {});
  }, [edicao]);

  function set(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  const dataFinal = useMemo(
    () => calcDataFinal(form.data_entrega, form.prazo_garantia_dias),
    [form.data_entrega, form.prazo_garantia_dias]
  );

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      const url = edicao ? `/api/garantias/${garantiaId}` : '/api/garantias';
      const method = edicao ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErro(data.error || 'Não foi possível salvar.');
        return;
      }
      const id = edicao ? garantiaId : data.garantia.id;
      router.push(`/garantias/${id}`);
      router.refresh();
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {erro && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</div>
      )}

      {/* Cliente */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Cliente</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nome do cliente *</label>
            <input className="input" value={form.cliente_nome} onChange={(e) => set('cliente_nome', e.target.value)} required />
          </div>
          <div>
            <label className="label">WhatsApp do cliente *</label>
            <input className="input" placeholder="(00) 00000-0000" value={form.cliente_whatsapp} onChange={(e) => set('cliente_whatsapp', e.target.value)} required />
          </div>
        </div>
      </div>

      {/* Aparelho */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Aparelho</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Marca *</label>
            <input className="input" placeholder="Samsung, Apple, Motorola..." value={form.marca_celular} onChange={(e) => set('marca_celular', e.target.value)} required />
          </div>
          <div>
            <label className="label">Modelo *</label>
            <input className="input" placeholder="Galaxy S21, iPhone 13..." value={form.modelo_celular} onChange={(e) => set('modelo_celular', e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">IMEI / Número de série (opcional)</label>
            <input className="input" value={form.imei} onChange={(e) => set('imei', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Serviço */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Serviço</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Serviço realizado *</label>
            <input className="input" placeholder="Troca de tela, troca de bateria..." value={form.servico_realizado} onChange={(e) => set('servico_realizado', e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Descrição do serviço</label>
            <textarea className="input min-h-[80px]" value={form.descricao_servico} onChange={(e) => set('descricao_servico', e.target.value)} />
          </div>
          <div>
            <label className="label">Valor do serviço (opcional)</label>
            <input type="number" step="0.01" min="0" className="input" placeholder="0,00" value={form.valor_servico ?? ''} onChange={(e) => set('valor_servico', e.target.value)} />
          </div>
        </div>
      </div>

      {/* Garantia */}
      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Garantia</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Data da entrega *</label>
            <input type="date" className="input" value={form.data_entrega} onChange={(e) => set('data_entrega', e.target.value)} required />
          </div>
          <div>
            <label className="label">Prazo de garantia (dias) *</label>
            <input type="number" min="1" className="input" value={form.prazo_garantia_dias} onChange={(e) => set('prazo_garantia_dias', e.target.value)} required />
          </div>
          <div>
            <label className="label">Data final da garantia</label>
            <div className="flex h-[42px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
              {dataFinal ? formatDate(dataFinal) : '— calculada automaticamente —'}
            </div>
          </div>
          <div className="sm:col-span-3">
            <label className="label">Observações internas (não aparecem para o cliente)</label>
            <textarea className="input min-h-[70px]" value={form.observacoes_internas} onChange={(e) => set('observacoes_internas', e.target.value)} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.back()}>
          Cancelar
        </button>
        <button type="submit" className="btn-primary" disabled={salvando}>
          {salvando ? 'Salvando...' : edicao ? 'Salvar alterações' : 'Cadastrar garantia'}
        </button>
      </div>
    </form>
  );
}
