export type ParamPencarian = Record<string, string | string[] | undefined>;

/** Ambil satu nilai parameter, mengabaikan bentuk larik. */
export function bacaParam(params: ParamPencarian, kunci: string): string | undefined {
  const nilai = params[kunci];
  const tunggal = Array.isArray(nilai) ? nilai[0] : nilai;
  const bersih = tunggal?.trim();
  return bersih ? bersih : undefined;
}

/** Ambil parameter berisi banyak nilai, ditulis dipisah koma. */
export function bacaDaftar(params: ParamPencarian, kunci: string): string[] {
  const nilai = bacaParam(params, kunci);
  if (!nilai) return [];
  return [...new Set(nilai.split(',').map((item) => item.trim()).filter(Boolean))];
}

/** Ambil parameter angka dengan batas aman. */
export function bacaAngka(
  params: ParamPencarian,
  kunci: string,
  { min = 0, max = Number.MAX_SAFE_INTEGER }: { min?: number; max?: number } = {},
): number | null {
  const nilai = Number(bacaParam(params, kunci));
  if (!Number.isFinite(nilai)) return null;
  return Math.min(Math.max(Math.trunc(nilai), min), max);
}

/**
 * Susun URL baru dari parameter saat ini plus perubahan.
 * Nilai `null` berarti parameter dihapus.
 */
export function buatUrl(
  basePath: string,
  params: ParamPencarian,
  perubahan: Record<string, string | string[] | number | null> = {},
): string {
  const hasil = new URLSearchParams();

  for (const [kunci, nilai] of Object.entries(params)) {
    if (kunci in perubahan) continue;
    const tunggal = Array.isArray(nilai) ? nilai[0] : nilai;
    if (tunggal) hasil.set(kunci, tunggal);
  }

  for (const [kunci, nilai] of Object.entries(perubahan)) {
    if (nilai === null || nilai === '' || (Array.isArray(nilai) && nilai.length === 0)) continue;
    hasil.set(kunci, Array.isArray(nilai) ? nilai.join(',') : String(nilai));
  }

  // Setiap kali filter berubah, kembali ke halaman pertama.
  if (!('hal' in perubahan)) hasil.delete('hal');

  const query = hasil.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/** Tambah atau hapus satu nilai dari daftar filter. */
export function alihkanNilai(daftar: string[], nilai: string): string[] {
  return daftar.includes(nilai) ? daftar.filter((item) => item !== nilai) : [...daftar, nilai];
}
