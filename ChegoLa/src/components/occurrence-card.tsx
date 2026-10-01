import Link from "next/link";
import { CalendarClock, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Occurrence, RiskLevel } from "@/lib/occurrences";

const RISK_CLASSES: Record<RiskLevel, string> = {
  "Não classificado": "bg-slate-100 text-slate-700",
  Alto: "bg-red-100 text-red-800",
  Médio: "bg-amber-100 text-amber-800",
  Baixo: "bg-cyan-100 text-cyan-800",
};

export function OccurrenceCard({ item }: { item: Occurrence }) {
  const published = new Intl.DateTimeFormat("pt-BR").format(
    new Date(`${item.date}T${item.time}:00`),
  );

  return (
    <Card className="relative overflow-hidden transition-transform hover:-translate-y-1 focus-within:ring-2 focus-within:ring-cyan-700">
      <div className="h-2 bg-gradient-to-r from-cyan-700 to-cyan-300" />
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-heading text-xl font-semibold">
              <Link
                href={`/mapa?foco=${item.id}`}
                className="rounded-sm underline-offset-4 after:absolute after:inset-0 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              >
                {item.place}
                <ChevronRight aria-hidden="true" className="ml-1 inline size-5 text-cyan-700" />
                <span className="sr-only">. Ver no mapa</span>
              </Link>
            </h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" /> {item.region}, Itaúna/MG
            </p>
          </div>
          <Badge className={RISK_CLASSES[item.risk]}>
            {item.risk === "Não classificado" ? "Risco não classificado" : `Risco ${item.risk}`}
          </Badge>
        </div>
        <p className="mt-5 line-clamp-3 leading-6 text-slate-600">{item.description}</p>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <CalendarClock className="size-4" aria-hidden="true" />
            {item.source === "Fonte oficial" ? "Publicado em " : ""}
            {published} {item.source === "Relato local" && `às ${item.time}`}
          </span>
          <Badge variant="outline">{item.source}</Badge>
        </div>
        {item.source === "Fonte oficial" && (
          <div className="mt-4 rounded-lg bg-cyan-50 p-3 text-sm leading-6 text-cyan-950">
            <p>
              Localização: {item.locationPrecision}. Consulta da fonte em{" "}
              {item.consultedAt
                ? new Intl.DateTimeFormat("pt-BR").format(new Date(`${item.consultedAt}T12:00:00`))
                : "data não informada"}.
            </p>
            {item.sourceUrl && (
              <a
                href={item.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="relative z-10 mt-1 inline-flex items-center gap-1 rounded-sm font-semibold underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
              >
                Ver publicação da Prefeitura <ExternalLink className="size-3.5" />
              </a>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
