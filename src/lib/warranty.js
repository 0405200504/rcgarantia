// Funções utilitárias de cálculo, status e formatação (sem dependências externas)

export function calcDataFinal(dataEntrega, prazoDias) {
  if (!dataEntrega || !prazoDias) return '';
  const d = new Date(dataEntrega + 'T00:00:00');
  d.setDate(d.getDate() + Number(prazoDias));
  return d.toISOString().slice(0, 10);
}

function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Retorna status calculado e dias restantes.
// status base armazenado: 'Ativa' | 'Cancelada'. 'Vencida' é derivada da data.
export function computeStatus(garantia) {
  if (garantia.status === 'Cancelada') {
    return { status: 'Cancelada', dias_restantes: null, cor: 'cinza' };
  }
  const hoje = startOfDay(new Date());
  const fim = startOfDay(new Date(garantia.data_final_garantia + 'T00:00:00'));
  const diffMs = fim.getTime() - hoje.getTime();
  const dias = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (dias < 0) {
    return { status: 'Vencida', dias_restantes: dias, cor: 'vermelho' };
  }
  if (dias <= 7) {
    return { status: 'Vencendo', dias_restantes: dias, cor: 'amarelo' };
  }
  return { status: 'Ativa', dias_restantes: dias, cor: 'verde' };
}

export const STATUS_BADGE = {
  Ativa: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  Vencendo: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  Vencida: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  Cancelada: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

export function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR');
}

export function formatMoney(value) {
  if (value == null || value === '') return '—';
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Normaliza WhatsApp para link wa.me (somente dígitos, adiciona 55 se necessário)
export function whatsappDigits(raw) {
  if (!raw) return '';
  let digits = String(raw).replace(/\D/g, '');
  if (digits.length <= 11 && !digits.startsWith('55')) {
    digits = '55' + digits;
  }
  return digits;
}

export function buildWhatsappLink(raw, mensagem) {
  const digits = whatsappDigits(raw);
  const text = encodeURIComponent(mensagem || '');
  return `https://wa.me/${digits}${text ? `?text=${text}` : ''}`;
}

export function mensagemComprovante(garantia, config, linkConsulta) {
  return (
    `Olá, ${garantia.cliente_nome}! Aqui está o comprovante de garantia do serviço realizado no seu ${garantia.modelo_celular}.\n\n` +
    `Código da garantia: ${garantia.codigo_garantia}\n` +
    `Serviço realizado: ${garantia.servico_realizado}\n` +
    `Data de entrega: ${formatDate(garantia.data_entrega)}\n` +
    `Garantia válida até: ${formatDate(garantia.data_final_garantia)}\n\n` +
    `Você pode consultar sua garantia por este link:\n${linkConsulta}`
  );
}
