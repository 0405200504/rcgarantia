import GarantiaForm from '@/components/GarantiaForm';

export default function NovaGarantiaPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">Nova garantia</h1>
        <p className="text-sm text-slate-500">
          A data final e o código da garantia são gerados automaticamente.
        </p>
      </div>
      <GarantiaForm />
    </div>
  );
}
