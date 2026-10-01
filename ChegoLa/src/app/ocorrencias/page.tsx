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
  loadAllOccurrences,
  OCCURRENCES_CHANGED_EVENT,
  type Occurrence,
  type OccurrenceSource,
  type RiskLevel,
} from "@/lib/occurrences";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

type LoadState = "loading" | "ready" | "error";
type RiskFilter = "Todos" | RiskLevel;
type SourceFilter = "Todas" | OccurrenceSource;

export default function OcorrenciasPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query);
  const [risk, setRisk] = useState<RiskFilter>("Todos");
  const [source, setSource] = useState<SourceFilter>("Todas");
  const [created, setCreated] = useState(false);

  function load() {
    setLoadState("loading");
    window.setTimeout(() => {
      const result = loadAllOccurrences();
      setOccurrences(result.occurrences);
      setError(result.error ?? "");
      setLoadState(result.error ? "error" : "ready");
    }, 300);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      load();
      setCreated(
        new URLSearchParams(window.location.search).get("created") === "1",
      );
    }, 0);
    window.addEventListener(OCCURRENCES_CHANGED_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(OCCURRENCES_CHANGED_EVENT, load);
      window.removeEventListener("storage", load);
    };
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
            Referência oficial histórica + relatos deste navegador
          </Badge>
          <h1 className="section-title">Pontos e relatos</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Consulte pontos publicados por fonte oficial e relatos não
            verificados. Nada é monitorado em tempo real.
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
          <AlertTitle>Ocorrência salva neste navegador</AlertTitle>
          <AlertDescription>
            O relato já aparece na lista e no mapa. Ele não foi enviado a um
            servidor nem validado por órgão oficial.
          </AlertDescription>
        </Alert>
      )}

      <Alert className="mt-6 border-amber-300 bg-amber-50">
        <AlertTriangle className="text-amber-700" />
        <AlertTitle>Aviso sobre os dados</AlertTitle>
        <AlertDescription>
          “Fonte oficial” identifica a origem da publicação, não a condição
          atual da via. Relatos locais são autodeclarados e ficam somente neste
          navegador. Não use esta página como única fonte para se deslocar.
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
        onRetry={load}
        onClear={() => {
          setQuery("");
          setRisk("Todos");
          setSource("Todas");
        }}
      />
    </div>
  );
}
