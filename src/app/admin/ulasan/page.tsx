import Link from 'next/link';

import { AksiUlasan } from '@/components/admin/aksi-ulasan';
import { RatingBintang } from '@/components/rating-bintang';
import { angka, tanggalJam } from '@/lib/format';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';

export const metadata = { title: 'Ulasan' };

interface BarisUlasan {
  id: string;
  rating: number;
  comment: string;
  is_approved: boolean;
  created_at: string;
  products: { name: string; slug: string } | null;
  profiles: { full_name: string; email: string | null } | null;
}

export default async function HalamanAdminUlasan() {
  const admin = createSupabaseAdminClient();
  const { data, count } = await admin
    .from('reviews')
    .select(
      'id, rating, comment, is_approved, created_at, products(name, slug), profiles(full_name, email)',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })
    .limit(100);

  const ulasan = (data ?? []) as unknown as BarisUlasan[];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-bold">Ulasan Pembeli</h1>
        <p className="mt-0.5 text-sm text-ink-500">
          {angka(count ?? 0)} ulasan masuk. Ulasan yang disembunyikan tidak tampil di halaman
          produk dan tidak dihitung dalam rata-rata rating.
        </p>
      </header>

      {ulasan.length === 0 ? (
        <div className="card px-5 py-14 text-center text-sm text-ink-500">
          Belum ada ulasan dari pembeli.
        </div>
      ) : (
        <ul className="space-y-3">
          {ulasan.map((item) => (
            <li key={item.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <RatingBintang nilai={item.rating} size={14} />
                    <span className="text-sm font-semibold">{item.rating}/5</span>
                    {!item.is_approved && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-ink-500">
                        Disembunyikan
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 text-sm">
                    {item.products ? (
                      <Link
                        href={`/produk/${item.products.slug}`}
                        target="_blank"
                        className="font-medium text-brand-700 hover:underline"
                      >
                        {item.products.name}
                      </Link>
                    ) : (
                      <span className="text-ink-500">Produk sudah dihapus</span>
                    )}
                  </p>

                  <p className="mt-0.5 text-xs text-ink-500">
                    {item.profiles?.full_name || 'Pelanggan'} · {tanggalJam(item.created_at)} WIB
                  </p>

                  {item.comment && (
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-700">
                      {item.comment}
                    </p>
                  )}
                </div>

                <AksiUlasan id={item.id} disetujui={item.is_approved} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
