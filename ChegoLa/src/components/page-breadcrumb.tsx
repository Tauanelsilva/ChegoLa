import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Crumb = {
  href?: string;
  label: string;
};

type PageBreadcrumbProps = {
  items: Crumb[];
  className?: string;
  tone?: "default" | "inverse";
};

export function PageBreadcrumb({
  items,
  className,
  tone = "default",
}: PageBreadcrumbProps) {
  const inverse = tone === "inverse";

  return (
    <nav aria-label="Trilha de navegação" className={className}>
      <ol
        className={cn(
          "flex flex-wrap items-center gap-1 text-sm",
          inverse ? "text-cyan-100" : "text-slate-500",
        )}
      >
        {items.map((item, index) => {
          const current = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight aria-hidden="true" className="size-4 shrink-0" />
              )}
              {current || !item.href ? (
                <span
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "font-semibold",
                    inverse ? "text-white" : "text-slate-900",
                  )}
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-sm font-semibold underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2",
                    inverse
                      ? "text-cyan-100 hover:text-white focus-visible:ring-white"
                      : "text-cyan-800 focus-visible:ring-cyan-700",
                  )}
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
