import { notFound } from 'next/navigation';
import { getGarantia } from '@/lib/db';
import GarantiaForm from '@/components/GarantiaForm';

export const dynamic = 'force-dynamic';

export default async function EditarGarantiaPage({ params }) {
  const g = await getGarantia(params.id);
  if (!g) notFound();

  const inicial = {
    cliente_nome: g.cliente_nome, cliente_whatsapp: g.cliente_whatsapp,
    marca_celular: g.marca_celular, modelo_celular: g.modelo_celular,
    imei: g.imei, servico_realizado: g.servico_realizado,
    descricao_servico: g.descricao_servico, data_entrega: g.data_entrega,
    prazo_garantia_dias: g.prazo_garantia_dias, valor_servico: g.valor_servico,
    observacoes_internas: g.observacoes_internas,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Editar garantia</h1>
        <p className="font-mono text-sm text-slate-500">{g.codigo_garantia}</p>
      </div>
      <GarantiaForm inicial={inicial} garantiaId={g.id} />
    </div>
  );
}
