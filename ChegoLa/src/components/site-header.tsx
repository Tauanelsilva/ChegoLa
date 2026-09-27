"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Waves } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Início" },
  { href: "/mapa", label: "Mapa Interativo" },
  { href: "/ocorrencias", label: "Ocorrências" },
  { href: "/sobre", label: "Sobre o Projeto" },
];

export function SiteHeader() {
  const pathname = usePathname();

  const nav = (mobile = false) =>
    links.map((link) => {
      const active = pathname === link.href;
      return (
        mobile ? (
          <SheetClose
            key={link.href}
            nativeButton={false}
            render={<Link href={link.href} aria-current={active ? "page" : undefined} className={cn("rounded-md px-3 py-2 text-base font-semibold transition-colors", active ? "bg-cyan-50 text-cyan-800" : "text-slate-600 hover:bg-slate-50 hover:text-cyan-800")} />}
          >
            {link.label}
          </SheetClose>
        ) : (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn("rounded-md px-3 py-2 text-sm font-semibold transition-colors", active ? "bg-cyan-50 text-cyan-800" : "text-slate-600 hover:bg-slate-50 hover:text-cyan-800")}
          >
            {link.label}
          </Link>
        )
      );
    });

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="page-shell flex h-18 items-center justify-between gap-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Chegolá? — início">
          <span className="grid size-10 place-items-center rounded-xl bg-cyan-700 text-white">
            <Waves className="size-6" />
          </span>
          <span className="font-heading text-2xl font-bold tracking-tight text-slate-900">
            Chegolá<span className="text-amber-500">?</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {nav()}
        </nav>

        <Link href="/informar" className={buttonVariants({ className: "hidden bg-amber-500 text-slate-950 hover:bg-amber-400 sm:inline-flex" })}>Informar ocorrência</Link>

        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" aria-label="Abrir menu" />}>
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle className="flex items-center gap-2">
              <Waves className="text-cyan-700" /> Chegolá?
            </SheetTitle>
            <nav className="mt-8 flex flex-col gap-2" aria-label="Navegação móvel">
              {nav(true)}
              <SheetClose nativeButton={false} render={<Link href="/informar" className={buttonVariants({ className: "mt-3 bg-amber-500 text-slate-950 hover:bg-amber-400" })} />}>
                Informar ocorrência
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
