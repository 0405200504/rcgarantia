import Link from 'next/link';
import { listGarantias } from '@/lib/db';
import { computeStatus, formatDate } from '@/lib/warranty';
import StatusBadge from '@/components/StatusBadge';

export const dynamic = 'force-dynamic';

function StatCard({ label, value, accent, hint }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent || 'text-slate-900'}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const garantias = await listGarantias();
  const comStatus = garantias.map((g) => ({ ...g, _s: computeStatus(g) }));

  const total = comStatus.length;
  const ativas = comStatus.filter((g) => g._s.status === 'Ativa' || g._s.status === 'Vencendo').length;
  const vencidas = comStatus.filter((g) => g._s.status === 'Vencida').length;
  const vencendo = comStatus.filter((g) => g._s.status === 'Vencendo').length;

  const contagem = {};
  for (const g of garantias) {
    const s = g.servico_realizado || 'Outros';
    contagem[s] = (contagem[s] || 0) + 1;
  }
  const topServicos = Object.entries(contagem).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxServico = topServicos.length ? topServicos[0][1] : 0;
  const recentes = comStatus.slice(0, 8);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Visão geral das garantias</p>
        </div>
        <Link href="/garantias/nova" className="btn-primary hidden sm:inline-flex">
          ＋ Nova garantia
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Total" value={total} />
        <StatCard label="Ativas" value={ativas} accent="text-emerald-600" />
        <StatCard label="Vencidas" value={vencidas} accent="text-red-600" />
        <StatCard label="Vencendo em 7d" value={vencendo} accent="text-amber-600" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Garantias recentes</h2>
            <Link href="/garantias" className="text-sm font-medium text-brand-600 hover:text-brand-700">Ver todas</Link>
          </div>
          <div className="overflow-x-auto">
            {recentes.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-slate-500">
                Nenhuma garantia ainda.{' '}
                <Link href="/garantias/nova" className="font-medium text-brand-600">Cadastrar</Link>
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                    {['Código','Cliente','Celular','Serviço','Entrega','Validade','Status',''].map(h => (
                      <th key={h} className="px-4 py-3 font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentes.map((g) => (
                    <tr key={g.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-mono text-xs text-slate-700">{g.codigo_garantia}</td>
                      <td className="px-4 py-3">{g.cliente_nome}</td>
                      <td className="px-4 py-3 text-slate-500">{g.modelo_celular}</td>
                      <td className="px-4 py-3 text-slate-500">{g.servico_realizado}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(g.data_entrega)}</td>
                      <td className="px-4 py-3 text-slate-500">{formatDate(g.data_final_garantia)}</td>
                      <td className="px-4 py-3"><StatusBadge status={g._s.status} /></td>
                      <td className="px-4 py-3">
                        <Link href={`/garantias/${g.id}`} className="font-medium text-brand-600 hover:text-brand-700">Ver</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-slate-900">Serviços mais realizados</h2>
          {topServicos.length === 0 ? (
            <p className="text-sm text-slate-500">Sem dados ainda.</p>
          ) : (
            <ul className="space-y-3">
              {topServicos.map(([nome, qtd]) => (
                <li key={nome}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="truncate text-slate-700">{nome}</span>
                    <span className="font-medium text-slate-500">{qtd}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-500" style={{ width: `${maxServico ? (qtd / maxServico) * 100 : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
