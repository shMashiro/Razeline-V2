const JALUR_BINTANG = 'm12 3.6 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8Z';

interface Props {
  nilai: number;
  size?: number;
  className?: string;
}

/** Lima bintang dengan pengisian sebagian sesuai nilai rating. */
export function RatingBintang({ nilai, size = 14, className }: Props) {
  const persen = Math.max(0, Math.min(100, (nilai / 5) * 100));

  return (
    <span
      className={`relative inline-flex shrink-0 ${className ?? ''}`}
      role="img"
      aria-label={`Rating ${nilai.toFixed(1)} dari 5`}
    >
      <span className="flex text-slate-200">
        {[0, 1, 2, 3, 4].map((i) => (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d={JALUR_BINTANG} />
          </svg>
        ))}
      </span>
      <span
        className="absolute inset-0 flex overflow-hidden text-amber-400"
        style={{ width: `${persen}%` }}
        aria-hidden="true"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className="shrink-0"
          >
            <path d={JALUR_BINTANG} />
          </svg>
        ))}
      </span>
    </span>
  );
}
