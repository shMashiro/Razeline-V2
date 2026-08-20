import Link from 'next/link';

import { Icon } from '@/components/icon';
import { Logo } from '@/components/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface-2">
      <header className="border-b bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-brand-600"
          >
            <Icon name="kiri" size={15} />
            Kembali ke toko
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>

      <footer className="border-t bg-white py-5">
        <p className="container-page text-center text-xs text-ink-500">
          &copy; {new Date().getFullYear()} Razeline Komputer — Cibeber, Kabupaten Lebak, Banten
        </p>
      </footer>
    </div>
  );
}
