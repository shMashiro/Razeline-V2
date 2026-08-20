'use client';

import { useActionState } from 'react';

import { PesanForm } from '@/components/pesan-form';
import { verifikasiDuaLangkah, type StatusForm } from '@/lib/actions/auth';

export function FormDuaLangkah({ lanjut }: { lanjut: string }) {
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(verifikasiDuaLangkah, {});

  return (
    <form action={aksi} className="space-y-4">
      <input type="hidden" name="lanjut" value={lanjut} />
      <PesanForm galat={status.galat} info={status.info} />

      <label>
        <span className="label">Kode dari aplikasi autentikator</span>
        <input
          name="kode"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          autoFocus
          autoComplete="one-time-code"
          className="field text-center text-2xl font-bold tracking-[0.5em]"
          placeholder="000000"
        />
      </label>

      <button type="submit" disabled={menunggu} className="btn btn-primary btn-lg w-full">
        {menunggu ? 'Memverifikasi...' : 'Lanjutkan'}
      </button>
    </form>
  );
}
