import Link from "next/link";

const links = [
  { href: "/mapa", label: "Mapa" },
  { href: "/ocorrencias", label: "Ocorrências" },
  { href: "/informar", label: "Informar" },
  { href: "/sobre", label: "Sobre" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="page-shell flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-slate-700">Chegolá? · Itaúna/MG</p>
        <nav className="flex flex-wrap gap-x-5" aria-label="Navegação do rodapé">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-sm text-sm text-slate-600 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
