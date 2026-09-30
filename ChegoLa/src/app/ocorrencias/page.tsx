"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  Inbox,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  loadAllOccurrences,
  OCCURRENCES_CHANGED_EVENT,
  type Occurrence,
  type OccurrenceSource,
  type RiskLevel,
} from "@/lib/occurrences";

type LoadState = "loading" | "ready" | "error";
type RiskFilter = "Todos" | RiskLevel;
type SourceFilter = "Todas" | OccurrenceSource;

const RISK_CLASSES: Record<RiskLevel, string> = {
  "Não classificado": "bg-slate-100 text-slate-700",
  Alto: "bg-red-100 text-red-800",
  Médio: "bg-amber-100 text-amber-800",
  Baixo: "bg-cyan-100 text-cyan-800",
};

export default function OcorrenciasPage() {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
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
    const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR");
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
  }, [occurrences, query, risk, source]);

  return (
    <div className="page-shell py-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
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

      <Card className="mt-6">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[1fr_180px_190px]">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-semibold">
              Buscar
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                id="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Local, bairro ou descrição"
                className="pl-9"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="risk-filter" className="text-sm font-semibold">
              Risco
            </label>
            <select
              id="risk-filter"
              value={risk}
              onChange={(event) => setRisk(event.target.value as RiskFilter)}
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option>Todos</option>
              <option>Não classificado</option>
              <option>Alto</option>
              <option>Médio</option>
              <option>Baixo</option>
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="source-filter" className="text-sm font-semibold">
              Origem
            </label>
            <select
              id="source-filter"
              value={source}
              onChange={(event) => setSource(event.target.value as SourceFilter)}
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
            >
              <option>Todas</option>
              <option>Fonte oficial</option>
              <option>Relato local</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {loadState === "loading" && (
        <div
          className="mt-8 grid gap-5 md:grid-cols-2"
          aria-label="Carregando ocorrências"
          aria-live="polite"
        >
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl border bg-white"
            >
              <div className="m-6 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mx-6 mt-5 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {loadState === "error" && (
        <Card className="mt-8 border-red-200">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <AlertTriangle className="size-12 text-red-600" />
            <h2 className="mt-4 font-heading text-2xl font-semibold">
              Não foi possível ler os relatos locais
            </h2>
            <p className="mt-2 max-w-lg text-muted-foreground">{error}</p>
            <Button className="mt-5" onClick={load}>
              <RefreshCw /> Tentar novamente
            </Button>
          </CardContent>
        </Card>
      )}

      {loadState === "ready" && filtered.length === 0 && (
        <Card className="mt-8 border-dashed">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <Inbox className="size-12 text-cyan-700" />
            <h2 className="mt-4 font-heading text-2xl font-semibold">
              Nenhuma ocorrência encontrada
            </h2>
            <p className="mt-2 text-muted-foreground">
              Ajuste a busca ou os filtros para ver outros resultados.
            </p>
            <Button
              variant="outline"
              className="mt-5"
              onClick={() => {
                setQuery("");
                setRisk("Todos");
                setSource("Todas");
              }}
            >
              Limpar filtros
            </Button>
          </CardContent>
        </Card>
      )}

      {loadState === "ready" && filtered.length > 0 && (
        <>
          <p className="mt-7 text-sm text-muted-foreground" aria-live="polite">
            {filtered.length} ocorrência{filtered.length > 1 ? "s" : ""}{" "}
            encontrada{filtered.length > 1 ? "s" : ""}.
          </p>
          <div className="mt-3 grid gap-5 md:grid-cols-2">
            {filtered.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden transition-transform hover:-translate-y-1"
              >
                <div className="h-2 bg-gradient-to-r from-cyan-700 to-cyan-300" />
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-heading text-xl font-semibold">
                        {item.place}
                      </h2>
                      <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="size-4" /> {item.region}, Itaúna/MG
                      </p>
                    </div>
                    <Badge className={RISK_CLASSES[item.risk]}>
                      {item.risk === "Não classificado"
                        ? "Risco não classificado"
                        : `Risco ${item.risk}`}
                    </Badge>
                  </div>
                  <p className="mt-5 line-clamp-3 leading-6 text-slate-600">
                    {item.description}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarClock className="size-4" />
                      {item.source === "Fonte oficial" ? "Publicado em " : ""}
                      {new Intl.DateTimeFormat("pt-BR").format(
                        new Date(`${item.date}T${item.time}:00`),
                      )}{" "}
                      {item.source === "Relato local" && `às ${item.time}`}
                    </span>
                    <Badge variant="outline">{item.source}</Badge>
                  </div>
                  {item.source === "Fonte oficial" && (
                    <div className="mt-4 rounded-lg bg-cyan-50 p-3 text-sm leading-6 text-cyan-950">
                      <p>
                        Localização: {item.locationPrecision}. Consulta da fonte
                        em {item.consultedAt
                          ? new Intl.DateTimeFormat("pt-BR").format(
                              new Date(`${item.consultedAt}T12:00:00`),
                            )
                          : "data não informada"}.
                      </p>
                      {item.sourceUrl && (
                        <a
                          href={item.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-flex items-center gap-1 font-semibold underline underline-offset-2"
                        >
                          Ver publicação da Prefeitura <ExternalLink className="size-3.5" />
                        </a>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
