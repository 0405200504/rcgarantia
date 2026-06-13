import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGarantia } from '@/lib/db';
import { computeStatus, formatDate, formatDateTime, formatMoney } from '@/lib/warranty';
import StatusBadge from '@/components/StatusBadge';
import DetalhesAcoes from '@/components/DetalhesAcoes';

export const dynamic = 'force-dynamic';

function Campo({ label, children, mono }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className={`mt-1 text-sm text-slate-800 ${mono ? 'font-mono' : ''}`}>{children || '—'}</dd>
    </div>
  );
}

export default async function DetalhesGarantiaPage({ params }) {
  const g = await getGarantia(params.id);
  if (!g) notFound();
  const s = computeStatus(g);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <Link href="/garantias" className="text-sm text-brand-600 hover:underline">← Voltar</Link>
      </div>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl font-semibold text-slate-900">{g.codigo_garantia}</h1>
            <StatusBadge status={s.status} />
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {g.cliente_nome} · {g.marca_celular} {g.modelo_celular}
            {s.dias_restantes != null && s.status !== 'Vencida' && s.status !== 'Cancelada' && (
              <span className="ml-2 text-slate-400">({s.dias_restantes} dias restantes)</span>
            )}
          </p>
        </div>
        <DetalhesAcoes garantia={g} id={g.id} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-slate-500">Dados da garantia</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
            <Campo label="Nome do cliente">{g.cliente_nome}</Campo>
            <Campo label="WhatsApp">{g.cliente_whatsapp}</Campo>
            <Campo label="Marca">{g.marca_celular}</Campo>
            <Campo label="Modelo">{g.modelo_celular}</Campo>
            <Campo label="IMEI / Nº de série" mono>{g.imei}</Campo>
            <Campo label="Serviço realizado">{g.servico_realizado}</Campo>
            <div className="sm:col-span-2"><Campo label="Descrição">{g.descricao_servico}</Campo></div>
            <Campo label="Data da entrega">{formatDate(g.data_entrega)}</Campo>
            <Campo label="Prazo">{g.prazo_garantia_dias} dias</Campo>
            <Campo label="Válida até">{formatDate(g.data_final_garantia)}</Campo>
            <Campo label="Valor do serviço">{formatMoney(g.valor_servico)}</Campo>
            <div className="sm:col-span-2"><Campo label="Observações internas">{g.observacoes_internas}</Campo></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">Status</h2>
            <StatusBadge status={s.status} />
            <dl className="mt-5 space-y-4">
              <Campo label="Criado em">{formatDateTime(g.criado_em)}</Campo>
              <Campo label="Última edição">{formatDateTime(g.atualizado_em)}</Campo>
            </dl>
          </div>
          <Link href={`/garantias/${g.id}/comprovante`} className="btn-primary w-full">
            Ver comprovante
          </Link>
        </div>
      </div>
    </div>
  );
}
