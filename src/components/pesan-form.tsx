import { Icon } from '@/components/icon';

interface Props {
  galat?: string;
  info?: string;
}

/** Kotak pesan galat/informasi seragam untuk seluruh formulir. */
export function PesanForm({ galat, info }: Props) {
  if (!galat && !info) return null;

  const kelas = galat
    ? 'border-rose-200 bg-rose-50 text-rose-800'
    : 'border-emerald-200 bg-emerald-50 text-emerald-800';

  return (
    <p
      role={galat ? 'alert' : 'status'}
      className={`flex items-start gap-2 rounded-lg border px-3.5 py-3 text-sm ${kelas}`}
    >
      <Icon name={galat ? 'peringatan' : 'centang'} size={17} className="mt-0.5 shrink-0" />
      <span>{galat ?? info}</span>
    </p>
  );
}
