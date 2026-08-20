'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react';

import { KUNCI_KERANJANG } from '@/lib/constants';
import type { ItemKeranjang } from '@/lib/types';

interface NilaiKeranjang {
  items: ItemKeranjang[];
  /** false selama isi localStorage belum terbaca (menghindari beda render server/klien). */
  siap: boolean;
  jumlahBarang: number;
  subtotal: number;
  tambah: (item: Omit<ItemKeranjang, 'quantity'>, jumlah?: number) => void;
  ubahJumlah: (id: string, jumlah: number) => void;
  hapus: (id: string) => void;
  kosongkan: () => void;
}

const KeranjangContext = createContext<NilaiKeranjang | null>(null);

const PERISTIWA_LOKAL = 'razeline:keranjang-berubah';
const KOSONG: ItemKeranjang[] = [];

/*
 * localStorage diperlakukan sebagai satu-satunya sumber kebenaran keranjang.
 * Komponen berlangganan lewat useSyncExternalStore agar perubahan dari tab
 * lain pun ikut tersinkron tanpa perlu efek tambahan.
 */
let cacheMentah: string | null = null;
let cacheNilai: ItemKeranjang[] = KOSONG;

function uraikan(mentah: string | null): ItemKeranjang[] {
  if (!mentah) return KOSONG;
  try {
    const hasil: unknown = JSON.parse(mentah);
    if (!Array.isArray(hasil)) return KOSONG;
    return hasil.filter(
      (item): item is ItemKeranjang =>
        typeof item?.id === 'string' &&
        typeof item?.price === 'number' &&
        typeof item?.quantity === 'number' &&
        item.quantity > 0,
    );
  } catch {
    return KOSONG;
  }
}

/** Snapshot stabil: referensi hanya berubah bila isi localStorage berubah. */
function bacaKeranjang(): ItemKeranjang[] {
  let mentah: string | null = null;
  try {
    mentah = window.localStorage.getItem(KUNCI_KERANJANG);
  } catch {
    return cacheNilai;
  }
  if (mentah !== cacheMentah) {
    cacheMentah = mentah;
    cacheNilai = uraikan(mentah);
  }
  return cacheNilai;
}

function tulisKeranjang(items: ItemKeranjang[]) {
  try {
    window.localStorage.setItem(KUNCI_KERANJANG, JSON.stringify(items));
  } catch {
    // Kuota penuh atau mode privat — abaikan agar belanja tetap bisa berjalan.
  }
  window.dispatchEvent(new Event(PERISTIWA_LOKAL));
}

function berlangganan(beriTahu: () => void) {
  const dariTabLain = (event: StorageEvent) => {
    if (event.key === KUNCI_KERANJANG) beriTahu();
  };
  window.addEventListener('storage', dariTabLain);
  window.addEventListener(PERISTIWA_LOKAL, beriTahu);
  return () => {
    window.removeEventListener('storage', dariTabLain);
    window.removeEventListener(PERISTIWA_LOKAL, beriTahu);
  };
}

export function KeranjangProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(berlangganan, bacaKeranjang, () => KOSONG);
  const siap = useSyncExternalStore(
    berlangganan,
    () => true,
    () => false,
  );

  const perbarui = useCallback((ubah: (sebelumnya: ItemKeranjang[]) => ItemKeranjang[]) => {
    tulisKeranjang(ubah(bacaKeranjang()));
  }, []);

  const tambah = useCallback(
    (item: Omit<ItemKeranjang, 'quantity'>, jumlah = 1) => {
      perbarui((sebelumnya) => {
        const ada = sebelumnya.find((baris) => baris.id === item.id);
        if (!ada) {
          return [...sebelumnya, { ...item, quantity: Math.min(jumlah, item.stock) }].filter(
            (baris) => baris.quantity > 0,
          );
        }
        return sebelumnya.map((baris) =>
          baris.id === item.id
            ? { ...baris, ...item, quantity: Math.min(baris.quantity + jumlah, item.stock) }
            : baris,
        );
      });
    },
    [perbarui],
  );

  const ubahJumlah = useCallback(
    (id: string, jumlah: number) => {
      perbarui((sebelumnya) =>
        sebelumnya
          .map((baris) =>
            baris.id === id
              ? { ...baris, quantity: Math.max(0, Math.min(jumlah, baris.stock)) }
              : baris,
          )
          .filter((baris) => baris.quantity > 0),
      );
    },
    [perbarui],
  );

  const hapus = useCallback(
    (id: string) => perbarui((sebelumnya) => sebelumnya.filter((baris) => baris.id !== id)),
    [perbarui],
  );

  const kosongkan = useCallback(() => perbarui(() => KOSONG), [perbarui]);

  const nilai = useMemo<NilaiKeranjang>(() => {
    const jumlahBarang = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
    return { items, siap, jumlahBarang, subtotal, tambah, ubahJumlah, hapus, kosongkan };
  }, [items, siap, tambah, ubahJumlah, hapus, kosongkan]);

  return <KeranjangContext.Provider value={nilai}>{children}</KeranjangContext.Provider>;
}

export function useKeranjang(): NilaiKeranjang {
  const konteks = useContext(KeranjangContext);
  if (!konteks) {
    throw new Error('useKeranjang harus dipakai di dalam KeranjangProvider.');
  }
  return konteks;
}
