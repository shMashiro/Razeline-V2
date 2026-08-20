import { KeranjangProvider } from '@/components/keranjang-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';

export default function TokoLayout({ children }: { children: React.ReactNode }) {
  return (
    <KeranjangProvider>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Lompat ke konten
      </a>
      <SiteHeader />
      <main id="konten" className="min-h-[60vh]">
        {children}
      </main>
      <SiteFooter />
    </KeranjangProvider>
  );
}
