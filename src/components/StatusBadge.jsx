import { STATUS_BADGE } from '@/lib/warranty';

export default function StatusBadge({ status }) {
  return <span className={`badge ${STATUS_BADGE[status] || STATUS_BADGE.Cancelada}`}>{status}</span>;
}
