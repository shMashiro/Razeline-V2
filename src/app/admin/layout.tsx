import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { MenuAdminMobile, SidebarAdmin } from '@/components/admin/nav-admin';
import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';
import { keluar } from '@/lib/actions/auth';
import { statusDuaLangkah, wajibAdmin } from '@/lib/auth';
import { DUA_LANGKAH_ADMIN_AKTIF } from '@/lib/fitur';
import { ambilPengaturanToko } from '@/lib/queries';

export const metadata: Metadata = {
  title: { default: 'Dasbor Admin', template: '%s | Admin Razeline' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profil = await wajibAdmin();
  const pengaturan = await ambilPengaturanToko();

  // Bila fitur dua langkah menyala, admin wajib mendaftarkan autentikator
  // sebelum halaman lain bisa dibuka.
  if (DUA_LANGKAH_ADMIN_AKTIF) {
    const keamanan = await statusDuaLangkah();
    const jalur = (await headers()).get('x-pathname') ?? '';
    if (!keamanan.aktif && !jalur.startsWith('/admin/keamanan')) {
      redirect('/admin/keamanan?wajib=1');
    }
  }

  return (
    <div className="min-h-dvh bg-surface-2">
      <header className="sticky top-0 z-40 border-b bg-white">
        <div className="mx-auto flex h-16 max-w-[100rem] items-center gap-3 px-4 sm:px-6">
          <MenuAdminMobile />
          <Logo logoUrl={pengaturan.logo_url} namaToko={pengaturan.store_name} />
          <span className="hidden rounded-md bg-brand-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-700 sm:inline">
            Panel Admin
          </span>

          <div className="ml-auto flex items-center gap-2">
            <Link href="/" className="btn btn-ghost btn-sm hidden sm:inline-flex">
              <Icon name="toko" size={16} />
              Lihat Toko
            </Link>
            <span className="hidden text-sm text-ink-500 md:inline">{profil.email}</span>
            <form action={keluar}>
              <button type="submit" className="btn btn-outline btn-sm">
                <Icon name="keluar" size={15} />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[100rem] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[14rem_1fr]">
        <aside>
          <SidebarAdmin />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
