'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Icon } from '@/components/icon';
import type { Banner } from '@/lib/types';

const JEDA_OTOMATIS = 6500;

const GRADASI = [
  'from-brand-700 via-brand-600 to-brand-500',
  'from-slate-800 via-slate-700 to-brand-700',
  'from-brand-800 via-brand-700 to-cyan-800',
];

export function CarouselBanner({ banners }: { banners: Banner[] }) {
  const [aktif, setAktif] = useState(0);
  const [berhenti, setBerhenti] = useState(false);
  const jumlah = banners.length;
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (jumlah <= 1 || berhenti) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => setAktif((i) => (i + 1) % jumlah), JEDA_OTOMATIS);
    return () => clearInterval(timer);
  }, [jumlah, berhenti]);

  if (jumlah === 0) return null;

  const pindah = (arah: 1 | -1) => setAktif((i) => (i + arah + jumlah) % jumlah);

  return (
    <div
      ref={wadah}
      className="relative overflow-hidden rounded-xl2"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promo pilihan"
      onMouseEnter={() => setBerhenti(true)}
      onMouseLeave={() => setBerhenti(false)}
      onFocusCapture={() => setBerhenti(true)}
      onBlurCapture={() => setBerhenti(false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight') pindah(1);
        if (event.key === 'ArrowLeft') pindah(-1);
      }}
    >
      <div
        className="flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${aktif * 100}%)` }}
      >
        {banners.map((banner, indeks) => (
          <div
            key={banner.id}
            className="w-full shrink-0"
            aria-hidden={indeks !== aktif}
            role="group"
            aria-roledescription="slide"
            aria-label={`${indeks + 1} dari ${jumlah}`}
          >
            <div
              className={`relative flex min-h-[16rem] flex-col justify-center overflow-hidden bg-gradient-to-br sm:min-h-[20rem] ${
                GRADASI[indeks % GRADASI.length]
              }`}
            >
              {banner.image_url && (
                <>
                  <Image
                    src={banner.image_url}
                    alt=""
                    fill
                    sizes="(max-width: 1280px) 100vw, 1216px"
                    priority={indeks === 0}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/20" />
                </>
              )}

              {!banner.image_url && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-[0.18]"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
                    backgroundSize: '22px 22px',
                  }}
                />
              )}

              <div className="relative max-w-2xl px-6 py-10 sm:px-10 sm:py-14">
                <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                  <Icon name="label" size={12} />
                  Razeline Komputer
                </p>
                <h2 className="text-2xl font-bold leading-tight text-white sm:text-4xl">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {banner.subtitle}
                  </p>
                )}
                {banner.link_url && (
                  <Link
                    href={banner.link_url}
                    className="btn btn-lg mt-6 bg-white text-brand-700 hover:bg-brand-50"
                    tabIndex={indeks === aktif ? 0 : -1}
                  >
                    {banner.cta_label}
                    <Icon name="panah" size={17} />
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {jumlah > 1 && (
        <>
          <button
            type="button"
            onClick={() => pindah(-1)}
            aria-label="Promo sebelumnya"
            className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/35 sm:block"
          >
            <Icon name="kiri" size={20} />
          </button>
          <button
            type="button"
            onClick={() => pindah(1)}
            aria-label="Promo berikutnya"
            className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-white/20 p-2 text-white backdrop-blur-sm transition-colors hover:bg-white/35 sm:block"
          >
            <Icon name="kanan" size={20} />
          </button>

          <div className="absolute bottom-4 left-6 flex gap-2 sm:left-10">
            {banners.map((banner, indeks) => (
              <button
                key={banner.id}
                type="button"
                onClick={() => setAktif(indeks)}
                aria-label={`Tampilkan promo ${indeks + 1}`}
                aria-current={indeks === aktif}
                className={`h-1.5 rounded-full transition-all ${
                  indeks === aktif ? 'w-7 bg-white' : 'w-3 bg-white/45 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
