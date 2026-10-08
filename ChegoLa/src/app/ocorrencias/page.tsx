"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { OccurrencePanel } from "@/components/occurrence-panel";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  type OccurrenceSource,
  type RiskLevel,
} from "@/lib/occurrences";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useOccurrenceFeed } from "@/hooks/use-occurrences";

type RiskFilter = "Todos" | RiskLevel;
type SourceFilter = "Todas" | OccurrenceSource;

export default function OcorrenciasPage() {
  const { occurrences, status: loadState, error, reload } = useOccurrenceFeed();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [risk, setRisk] = useState<RiskFilter>("Todos");
  const [source, setSource] = useState<SourceFilter>("Todas");
  const [created, setCreated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setCreated(new URLSearchParams(window.location.search).get("created") === "1");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLocaleLowerCase("pt-BR");
    return occurrences.filter((occurrence) => {
      const matchesQuery =
        !normalizedQuery ||
        `${occurrence.place} ${occurrence.region} ${occurrence.description}`
          .toLocaleLowerCase("pt-BR")
          .includes(normalizedQuery);
      const matchesRisk = risk === "Todos" || occurrence.risk === risk;
      const matchesSource = source === "Todas" || occurrence.source === source;
      return matchesQuery && matchesRisk && matchesSource;
    });
  }, [occurrences, debouncedQuery, risk, source]);

  return (
    <div className="page-shell py-8 md:py-12">
      <PageBreadcrumb
        items={[{ href: "/", label: "Início" }, { label: "Ocorrências" }]}
      />
      <div className="mt-4 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 bg-cyan-100 text-cyan-800">
            Referência oficial histórica + relatos do site
          </Badge>
          <h1 className="section-title">Pontos e relatos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Consulte pontos publicados por fonte oficial e relatos não
            verificados. Um relato enviado neste navegador pode ser apagado da
            lista. Nada é monitorado em tempo real.
          </p>
        </div>
        <Link
          href="/informar"
          className={buttonVariants({
            className: "bg-cyan-700 hover:bg-cyan-800",
          })}
        >
          Informar ocorrência
        </Link>
      </div>

      {created && (
        <Alert className="mt-6 border-emerald-300 bg-emerald-50">
          <CheckCircle2 className="text-emerald-700" />
          <AlertTitle>Ocorrência publicada</AlertTitle>
          <AlertDescription>
            O relato já aparece na lista e no mapa para quem acessar o site.
            Neste navegador, use Excluir para tirá-lo da lista e do mapa.
            Ele não foi validado por órgão oficial.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="mt-6 border-amber-300 bg-amber-50">
        <AlertTriangle className="text-amber-700" />
        <AlertTitle>Aviso sobre os dados</AlertTitle>
        <AlertDescription>
          “Fonte oficial” identifica a origem da publicação, não a condição
          atual da via. Relatos locais são autodeclarados e ficam visíveis
          neste site. Não use esta página como única fonte para se deslocar.
        </AlertDescription>
      </Alert>

      <OccurrencePanel
        query={query}
        risk={risk}
        source={source}
        loadState={loadState}
        error={error}
        items={filtered}
        onQuery={setQuery}
        onRisk={setRisk}
        onSource={setSource}
        onRetry={reload}
        onClear={() => {
          setQuery("");
          setRisk("Todos");
          setSource("Todas");
        }}
      />
    </div>
  );
}
