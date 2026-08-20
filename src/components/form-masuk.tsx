'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { Icon } from '@/components/icon';
import { PesanForm } from '@/components/pesan-form';
import { masuk, type StatusForm } from '@/lib/actions/auth';

export function FormMasuk({ lanjut }: { lanjut: string }) {
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(masuk, {});
  const [lihatSandi, setLihatSandi] = useState(false);

  return (
    <form action={aksi} className="space-y-4">
      <input type="hidden" name="lanjut" value={lanjut} />
      <PesanForm galat={status.galat} info={status.info} />

      <label>
        <span className="label">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          maxLength={120}
          className="field"
          placeholder="nama@email.com"
        />
      </label>

      <label>
        <span className="label">Kata sandi</span>
        <span className="relative block">
          <input
            name="password"
            type={lihatSandi ? 'text' : 'password'}
            required
            autoComplete="current-password"
            maxLength={72}
            className="field pr-11"
            placeholder="Masukkan kata sandi"
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

      <button type="submit" disabled={menunggu} className="btn btn-primary btn-lg w-full">
        {menunggu ? 'Memeriksa...' : 'Masuk'}
      </button>

      <p className="text-center text-sm text-ink-500">
        Belum punya akun?{' '}
        <Link href="/daftar" className="font-semibold text-brand-600 hover:underline">
          Daftar sekarang
        </Link>
      </p>
    </form>
  );
}
