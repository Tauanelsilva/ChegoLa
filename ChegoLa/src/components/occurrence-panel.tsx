import { AlertTriangle, Inbox, RefreshCw, Search } from "lucide-react";
import { OccurrenceCard } from "@/components/occurrence-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Occurrence, OccurrenceSource, RiskLevel } from "@/lib/occurrences";

type LoadState = "loading" | "ready" | "error";
type RiskFilter = "Todos" | RiskLevel;
type SourceFilter = "Todas" | OccurrenceSource;

type OccurrencePanelProps = {
  query: string;
  risk: RiskFilter;
  source: SourceFilter;
  loadState: LoadState;
  error: string;
  items: Occurrence[];
  onQuery: (value: string) => void;
  onRisk: (value: RiskFilter) => void;
  onSource: (value: SourceFilter) => void;
  onRetry: () => void;
  onClear: () => void;
};

export function OccurrencePanel({
  query,
  risk,
  source,
  loadState,
  error,
  items,
  onQuery,
  onRisk,
  onSource,
  onRetry,
  onClear,
}: OccurrencePanelProps) {
  return (
    <>
      <Card className="mt-6">
        <CardContent className="grid gap-4 pt-6 md:grid-cols-[1fr_180px_190px]">
          <div className="space-y-2">
            <label htmlFor="search" className="text-sm font-semibold">Buscar</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
              <Input id="search" value={query} onChange={(event) => onQuery(event.target.value)} placeholder="Local, bairro ou descrição" className="h-11 pl-9" />
            </div>
          </div>
          <FilterSelect id="risk-filter" label="Risco" value={risk} onChange={(value) => onRisk(value as RiskFilter)} options={["Todos", "Não classificado", "Alto", "Médio", "Baixo"]} />
          <FilterSelect id="source-filter" label="Origem" value={source} onChange={(value) => onSource(value as SourceFilter)} options={["Todas", "Fonte oficial", "Relato local"]} />
        </CardContent>
      </Card>

      {loadState === "loading" && (
        <div className="mt-8 grid gap-4 md:grid-cols-2" aria-label="Carregando ocorrências" aria-live="polite">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-48 animate-pulse rounded-2xl border bg-white">
              <div className="m-6 h-4 w-2/3 rounded bg-slate-200" />
              <div className="mx-6 mt-4 h-3 w-1/2 rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {loadState === "error" && (
        <Card className="mt-8 border-red-200">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <AlertTriangle className="size-12 text-red-600" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-2xl font-semibold">Não foi possível ler os relatos locais</h2>
            <p className="mt-2 max-w-lg text-muted-foreground">{error}</p>
            <Button className="mt-4 min-h-11" onClick={onRetry}><RefreshCw /> Tentar novamente</Button>
          </CardContent>
        </Card>
      )}

      {loadState === "ready" && items.length === 0 && (
        <Card className="mt-8 border-dashed">
          <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
            <Inbox className="size-12 text-cyan-700" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-2xl font-semibold">Nenhuma ocorrência encontrada</h2>
            <p className="mt-2 text-muted-foreground">Ajuste a busca ou os filtros para ver outros resultados.</p>
            <Button variant="outline" className="mt-4 min-h-11" onClick={onClear}>Limpar filtros</Button>
          </CardContent>
        </Card>
      )}

      {loadState === "ready" && items.length > 0 && (
        <>
          <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">
            {items.length} ocorrência{items.length > 1 ? "s" : ""} encontrada{items.length > 1 ? "s" : ""}.
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            {items.map((item) => <OccurrenceCard key={item.id} item={item} />)}
          </div>
        </>
      )}
    </>
  );
}

function FilterSelect({ id, label, value, onChange, options }: { id: string; label: string; value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-semibold">{label}</label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </div>
  );
}
