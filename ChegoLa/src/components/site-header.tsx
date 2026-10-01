"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
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

function InformarOcorrenciaLink({
  className,
  current = false,
}: {
  className?: string;
  current?: boolean;
}) {
  return (
    <Link
      href="/informar"
      aria-current={current ? "page" : undefined}
      className={buttonVariants({
        size: "lg",
        className: cn(
          "min-h-11 rounded-full bg-cyan-700! px-5 text-white! hover:bg-cyan-800! focus-visible:ring-cyan-800",
          className,
        ),
      })}
    >
      Informar ocorrência
    </Link>
  );
}

export function SiteHeader() {
  const pathname = usePathname();

  const nav = (mobile = false) =>
    links.map((link) => {
      const active = pathname === link.href;
      const itemClass = cn(
        "inline-flex min-h-11 items-center rounded-md px-3 font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700",
        mobile ? "text-base" : "text-sm",
        active
          ? mobile
            ? "bg-cyan-50 text-cyan-800"
            : "relative text-cyan-800 after:absolute after:inset-x-3 after:bottom-2 after:h-0.5 after:rounded-full after:bg-cyan-700"
          : "text-slate-600 hover:bg-slate-50 hover:text-cyan-800",
      );
      return mobile ? (
        <SheetClose
          key={link.href}
          nativeButton={false}
          render={<Link href={link.href} aria-current={active ? "page" : undefined} className={itemClass} />}
        >
          {link.label}
        </SheetClose>
      ) : (
        <Link
          key={link.href}
          href={link.href}
          aria-current={active ? "page" : undefined}
          className={itemClass}
        >
          {link.label}
        </Link>
      );
    });

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="page-shell flex min-h-16 items-center justify-between gap-4 py-2">
        <Link href="/" className="shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700" aria-label="Chegolá? — início">
          <BrandLogo
            priority
            className="w-40 sm:w-48"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navegação principal">
          {nav()}
          <InformarOcorrenciaLink
            current={pathname === "/informar"}
            className={pathname === "/informar" ? "ring-2 ring-cyan-800 ring-offset-2" : undefined}
          />
        </nav>

        <Sheet>
          <SheetTrigger render={<Button variant="outline" size="icon" className="size-11 lg:hidden!" aria-label="Abrir menu" />}>
            <Menu />
          </SheetTrigger>
          <SheetContent>
            <SheetTitle>
              <BrandLogo className="w-48" />
            </SheetTitle>
            <nav className="mt-8 flex flex-col gap-2" aria-label="Navegação móvel">
              {nav(true)}
              <SheetClose
                nativeButton={false}
                render={
                  <Link
                    href="/informar"
                    aria-current={pathname === "/informar" ? "page" : undefined}
                    className={buttonVariants({
                      size: "lg",
                      className: "mt-2 min-h-11 w-full rounded-full bg-cyan-700! px-5 text-white! hover:bg-cyan-800!",
                    })}
                  />
                }
              >
                Informar ocorrência
              </SheetClose>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
