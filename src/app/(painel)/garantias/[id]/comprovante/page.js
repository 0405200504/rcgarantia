import { notFound } from 'next/navigation';
import { getGarantia, getConfig } from '@/lib/db';
import { computeStatus, formatDate } from '@/lib/warranty';
import StatusBadge from '@/components/StatusBadge';
import ComprovanteToolbar from '@/components/ComprovanteToolbar';

export const dynamic = 'force-dynamic';

function Linha({ label, children }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 py-2.5 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-800">{children}</span>
    </div>
  );
}

export default async function ComprovantePage({ params }) {
  const [g, config] = await Promise.all([getGarantia(params.id), getConfig()]);
  if (!g) notFound();
  const s = computeStatus(g);

  return (
    <div className="mx-auto max-w-3xl">
      <ComprovanteToolbar garantia={g} voltarHref={`/garantias/${g.id}`} />

      <div className="print-area card overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-8 py-6 text-white"
          style={{ background: config.cor_principal || '#2563eb' }}>
          <div className="flex items-center gap-4">
            {config.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={config.logo_url} alt="Logo" className="h-14 w-14 rounded-lg bg-white/10 object-contain p-1" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-white/15 text-xl font-bold">
                {(config.nome_assistencia || 'RC').slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-xl font-semibold">{config.nome_assistencia}</h1>
              <p className="text-sm text-white/80">Comprovante de Garantia</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-semibold">{g.codigo_garantia}</p>
            {config.whatsapp && <p className="text-xs text-white/80">{config.whatsapp}</p>}
          </div>
        </div>

        <div className="px-8 py-6">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-slate-500">Situação</span>
            <StatusBadge status={s.status} />
          </div>

          <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
            <div>
              <Linha label="Cliente">{g.cliente_nome}</Linha>
              <Linha label="Aparelho">{g.marca_celular} {g.modelo_celular}</Linha>
              <Linha label="Serviço">{g.servico_realizado}</Linha>
            </div>
            <div>
              <Linha label="Data de entrega">{formatDate(g.data_entrega)}</Linha>
              <Linha label="Válida até">{formatDate(g.data_final_garantia)}</Linha>
              <Linha label="Prazo total">{g.prazo_garantia_dias} dias</Linha>
            </div>
          </div>

          {config.mostrar_valor_comprovante && g.valor_servico != null && (
            <Linha label="Valor do serviço">
              {Number(g.valor_servico).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </Linha>
          )}

          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Termos da garantia</h2>
            <p className="text-sm leading-relaxed text-slate-600">{config.termos_garantia}</p>
          </div>

          {config.endereco && <p className="mt-4 text-center text-xs text-slate-400">{config.endereco}</p>}

          <div className="mt-10 flex flex-col items-center">
            <div className="w-64 border-t border-slate-300 pt-2 text-center text-sm font-medium text-slate-700">
              {config.nome_assistencia}
            </div>
            {config.cnpj && <p className="mt-1 text-xs text-slate-400">CNPJ: {config.cnpj}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
