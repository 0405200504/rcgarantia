'use client';

import { useEffect, useState } from 'react';

const TERMOS_PADRAO =
  'A garantia cobre exclusivamente o serviço realizado e as peças substituídas neste atendimento, ' +
  'dentro do prazo informado neste comprovante. A garantia não cobre danos causados por queda, ' +
  'contato com líquidos, mau uso, violação do aparelho por terceiros, uso de acessórios inadequados ' +
  'ou novos defeitos não relacionados ao serviço executado.';

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState(null);
  const [msg, setMsg] = useState(null); // {tipo, texto}
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => setConfig(d.config))
      .catch(() => setMsg({ tipo: 'erro', texto: 'Não foi possível carregar as configurações.' }));
  }, []);

  function set(campo, valor) {
    setConfig((prev) => ({ ...prev, [campo]: valor }));
  }

  function onLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.5 * 1024 * 1024) {
      setMsg({ tipo: 'erro', texto: 'A logo deve ter no máximo 1,5 MB.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => set('logo_url', reader.result);
    reader.readAsDataURL(file);
  }

  async function salvar(e) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ tipo: 'erro', texto: data.error || 'Erro ao salvar.' });
        return;
      }
      setConfig(data.config);
      setMsg({ tipo: 'ok', texto: 'Configurações salvas com sucesso.' });
    } catch {
      setMsg({ tipo: 'erro', texto: 'Erro de conexão.' });
    } finally {
      setSalvando(false);
    }
  }

  if (!config) {
    return <p className="text-sm text-slate-500">Carregando configurações...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Configurações</h1>
        <p className="text-sm text-slate-500">Esses dados aparecem nos comprovantes de garantia.</p>
      </div>

      {msg && (
        <div
          className={`mb-4 rounded-lg px-3 py-2 text-sm ${
            msg.tipo === 'ok'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {msg.texto}
        </div>
      )}

      <form onSubmit={salvar} className="space-y-6">
        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Dados da assistência</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Nome da assistência</label>
              <input className="input" value={config.nome_assistencia || ''} onChange={(e) => set('nome_assistencia', e.target.value)} />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input className="input" value={config.whatsapp || ''} onChange={(e) => set('whatsapp', e.target.value)} />
            </div>
            <div>
              <label className="label">CNPJ (opcional)</label>
              <input className="input" value={config.cnpj || ''} onChange={(e) => set('cnpj', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Endereço</label>
              <input className="input" value={config.endereco || ''} onChange={(e) => set('endereco', e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Aparência e comprovante</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Logo da empresa</label>
              <div className="flex items-center gap-3">
                {config.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={config.logo_url} alt="Logo" className="h-12 w-12 rounded-lg border border-slate-200 object-contain" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400">
                    sem logo
                  </div>
                )}
                <input type="file" accept="image/*" onChange={onLogo} className="text-sm" />
                {config.logo_url && (
                  <button type="button" className="text-xs text-red-600 hover:underline" onClick={() => set('logo_url', '')}>
                    remover
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="label">Cor principal do sistema</label>
              <div className="flex items-center gap-3">
                <input type="color" value={config.cor_principal || '#2563eb'} onChange={(e) => set('cor_principal', e.target.value)} className="h-10 w-14 cursor-pointer rounded border border-slate-300" />
                <input className="input" value={config.cor_principal || ''} onChange={(e) => set('cor_principal', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="label">Prazo padrão de garantia (dias)</label>
              <input type="number" min="1" className="input" value={config.prazo_padrao_garantia || ''} onChange={(e) => set('prazo_padrao_garantia', e.target.value)} />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={!!config.mostrar_valor_comprovante} onChange={(e) => set('mostrar_valor_comprovante', e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
                Mostrar valor do serviço no comprovante
              </label>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Termos da garantia</h2>
            <button type="button" className="text-xs text-brand-600 hover:underline" onClick={() => set('termos_garantia', TERMOS_PADRAO)}>
              Restaurar texto padrão
            </button>
          </div>
          <textarea className="input min-h-[140px]" value={config.termos_garantia || ''} onChange={(e) => set('termos_garantia', e.target.value)} />
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </div>
  );
}
