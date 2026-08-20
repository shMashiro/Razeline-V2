'use client';

import { useActionState } from 'react';

import { PesanForm } from '@/components/pesan-form';
import { kirimUlangKode, verifikasiKode, type StatusForm } from '@/lib/actions/auth';

export function FormVerifikasi({ email }: { email: string }) {
  const [status, aksi, menunggu] = useActionState<StatusForm, FormData>(verifikasiKode, {});
  const [statusKirim, aksiKirim, menungguKirim] = useActionState<StatusForm, FormData>(
    kirimUlangKode,
    {},
  );

  return (
    <div className="space-y-4">
      <form action={aksi} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <PesanForm galat={status.galat ?? statusKirim.galat} info={statusKirim.info} />

        <label>
          <span className="label">Kode verifikasi</span>
          <input
            name="token"
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            required
            autoComplete="one-time-code"
            autoFocus
            className="field text-center text-2xl font-bold tracking-[0.5em]"
            placeholder="000000"
            aria-describedby="petunjuk-otp"
          />
          <span id="petunjuk-otp" className="mt-1.5 block text-xs text-ink-500">
            Masukkan 6 angka yang dikirim ke {email}.
          </span>
        </label>

        <button type="submit" disabled={menunggu} className="btn btn-primary btn-lg w-full">
          {menunggu ? 'Memverifikasi...' : 'Verifikasi Akun'}
        </button>
      </form>

      <form action={aksiKirim} className="text-center">
        <input type="hidden" name="email" value={email} />
        <button
          type="submit"
          disabled={menungguKirim}
          className="text-sm font-semibold text-brand-600 hover:underline disabled:text-ink-300"
        >
          {menungguKirim ? 'Mengirim ulang...' : 'Belum menerima kode? Kirim ulang'}
        </button>
      </form>
    </div>
  );
}
