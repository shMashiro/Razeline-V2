'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import { daftar, type StatusForm } from '@/lib/actions/auth';

export function FormDaftar() {
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(daftar, {});
  const [sandi, setSandi] = useState('');
  const [lihatSandi, setLihatSandi] = useState(false);

  const syarat = [
    { teks: 'Minimal 8 karakter', lulus: sandi.length >= 8 },
    { teks: 'Mengandung huruf', lulus: /[a-zA-Z]/.test(sandi) },
    { teks: 'Mengandung angka', lulus: /[0-9]/.test(sandi) },
  ];

  return (
    <form action={aksi} className="space-y-4">
      <PesanForm galat={status.galat} info={status.info} />

      <label>
        <span className="label">Nama lengkap</span>
        <input
          name="full_name"
          required
          minLength={3}
          maxLength={80}
          autoComplete="name"
          className="field"
          placeholder="Contoh: Ahmad Fauzi"
        />
      </label>

      <label>
        <span className="label">Email</span>
        <input
          name="email"
          type="email"
          required
          maxLength={120}
          autoComplete="email"
          className="field"
          placeholder="nama@email.com"
        />
      </label>

      <label>
        <span className="label">
          Nomor WhatsApp <span className="font-normal text-ink-300">(opsional)</span>
        </span>
        <input
          name="phone"
          type="tel"
          maxLength={20}
          autoComplete="tel"
          className="field"
          placeholder="081234567890"
        />
      </label>

      <div>
        <label>
          <span className="label">Kata sandi</span>
          <span className="relative block">
            <input
              name="password"
              type={lihatSandi ? 'text' : 'password'}
              required
              minLength={8}
              maxLength={72}
              autoComplete="new-password"
              className="field pr-11"
              placeholder="Buat kata sandi"
              value={sandi}
              onChange={(event) => setSandi(event.target.value)}
            />
            <button
              type="button"
              onClick={() => setLihatSandi((n) => !n)}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-300 hover:text-ink-700"
              aria-label={lihatSandi ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
            >
              <Icon name="mata" size={17} />
            </button>
          </span>
        </label>

        <ul className="mt-2 space-y-1">
          {syarat.map((item) => (
            <li
              key={item.teks}
              className={`flex items-center gap-1.5 text-xs ${
                item.lulus ? 'text-emerald-700' : 'text-ink-500'
              }`}
            >
              <Icon name={item.lulus ? 'centang' : 'kurang'} size={13} />
              {item.teks}
            </li>
          ))}
        </ul>
      </div>

      <button type="submit" disabled={menunggu} className="btn btn-primary btn-lg w-full">
        {menunggu ? 'Mendaftarkan...' : 'Buat Akun'}
      </button>

      <p className="text-center text-xs leading-relaxed text-ink-500">
        Dengan mendaftar, Anda menyetujui data pesanan disimpan untuk keperluan pengiriman dan
        garansi.
      </p>

      <p className="text-center text-sm text-ink-500">
        Sudah punya akun?{' '}
        <Link href="/masuk" className="font-semibold text-brand-600 hover:underline">
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
