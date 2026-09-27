import Link from "next/link";
import { Waves } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-slate-950 py-10 text-slate-300">
      <div className="page-shell flex flex-col justify-between gap-8 md:flex-row">
        <div className="max-w-md">
          <div className="mb-3 flex items-center gap-2 font-heading text-xl font-bold text-white">
            <Waves className="text-cyan-400" /> Chegolá?
          </div>
          <p className="text-sm leading-6">
            Protótipo demonstrativo para apoiar a comunicação sobre alagamentos em Itaúna/MG.
            Os dados exibidos não são oficiais.
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
