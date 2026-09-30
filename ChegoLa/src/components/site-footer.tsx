import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-slate-950 py-10 text-slate-300">
      <div className="page-shell flex flex-col justify-between gap-8 md:flex-row">
        <div className="max-w-md">
          <div className="mb-4 inline-flex rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-white/10">
            <BrandLogo className="w-56 max-w-full" />
          </div>
          <p className="text-sm leading-6">
            Protótipo demonstrativo para apoiar a comunicação sobre alagamentos em Itaúna/MG.
            Pontos de fonte oficial são históricos; relatos colaborativos não são verificados.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Navegação do rodapé">
          <Link href="/mapa" className="hover:text-white">Mapa</Link>
          <Link href="/ocorrencias" className="hover:text-white">Ocorrências</Link>
          <Link href="/informar" className="hover:text-white">Informar</Link>
          <Link href="/sobre" className="hover:text-white">Sobre</Link>
        </nav>
      </div>
    </footer>
  );
}
