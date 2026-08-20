'use client';

import { useActionState } from 'react';

import { PesanForm } from '@/components/pesan-form';
import { simpanProfil, type StatusAkun } from '@/lib/actions/akun';
import type { Profil } from '@/lib/types';

export function FormProfil({ profil }: { profil: Profil }) {
  const [status, aksi, menunggu] = useActionState<StatusAkun, FormData>(simpanProfil, {});

  return (
    <form action={aksi} className="space-y-4">
      <PesanForm galat={status.galat} info={status.info} />

      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Nama lengkap</span>
          <input
            name="full_name"
            required
            minLength={3}
            maxLength={80}
            defaultValue={profil.full_name}
            className="field"
          />
        </label>

        <label>
          <span className="label">Nomor WhatsApp</span>
          <input
            name="phone"
            type="tel"
            maxLength={20}
            defaultValue={profil.phone ?? ''}
            className="field"
            placeholder="081234567890"
          />
        </label>

        <label className="sm:col-span-2">
          <span className="label">Email</span>
          <input value={profil.email ?? ''} disabled className="field" />
          <span className="mt-1.5 block text-xs text-ink-500">
            Email dipakai sebagai identitas akun dan tidak bisa diubah sendiri. Hubungi admin bila
            perlu penggantian.
          </span>
        </label>
      </div>

      <button type="submit" disabled={menunggu} className="btn btn-primary">
        {menunggu ? 'Menyimpan...' : 'Simpan Perubahan'}
      </button>
    </form>
  );
}
