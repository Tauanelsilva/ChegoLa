"use client";

import { useState } from "react";
import { AlertTriangle, CalendarClock, Inbox, MapPin, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const occurrences = [
  { place: "Av. Jove Soares", region: "Centro", risk: "Alto", updated: "há 18 min", color: "bg-red-100 text-red-800" },
  { place: "Rua Silva Jardim", region: "Garcias", risk: "Médio", updated: "há 42 min", color: "bg-amber-100 text-amber-800" },
  { place: "Av. Dr. Miguel Augusto Gonçalves", region: "Santanense", risk: "Baixo", updated: "há 1 h", color: "bg-cyan-100 text-cyan-800" },
  { place: "Rua Antônio Corradi", region: "Nogueira Machado", risk: "Médio", updated: "há 2 h", color: "bg-amber-100 text-amber-800" },
];

type View = "data" | "loading" | "empty" | "error";

export default function OcorrenciasPage() {
  const [view, setView] = useState<View>("data");

  function select(next: View) {
    setView(next);
    if (next === "loading") window.setTimeout(() => setView("data"), 1100);
  }

  return (
    <div className="page-shell py-12">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Badge className="mb-3 bg-cyan-100 text-cyan-800">Conteúdo fictício para demonstração</Badge>
          <h1 className="section-title">Ocorrências recentes</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Acompanhe relatos simulados de alagamento em diferentes regiões de Itaúna.</p>
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Simular estados da lista">
          <Button size="sm" variant={view === "data" ? "default" : "outline"} onClick={() => select("data")}>Com dados</Button>
          <Button size="sm" variant="outline" onClick={() => select("loading")}>Carregando</Button>
          <Button size="sm" variant="outline" onClick={() => select("empty")}>Vazio</Button>
          <Button size="sm" variant="outline" onClick={() => select("error")}>Erro</Button>
        </div>
      </div>

      <Alert className="mt-8 border-amber-300 bg-amber-50">
        <AlertTriangle className="text-amber-700" />
        <AlertTitle>Aviso sobre os dados</AlertTitle>
        <AlertDescription>Todos os endereços, riscos e horários desta página são simulados e não devem orientar deslocamentos reais.</AlertDescription>
      </Alert>

      {view === "loading" && (
        <div className="mt-8 grid gap-5 md:grid-cols-2" aria-label="Carregando ocorrências">
          {[1, 2, 3, 4].map((item) => <div key={item} className="h-44 animate-pulse rounded-2xl border bg-white"><div className="m-6 h-4 w-2/3 rounded bg-slate-200" /><div className="mx-6 mt-5 h-3 w-1/2 rounded bg-slate-100" /></div>)}
        </div>
      )}

      {view === "empty" && (
        <Card className="mt-8 border-dashed"><CardContent className="flex min-h-72 flex-col items-center justify-center text-center"><Inbox className="size-12 text-cyan-700" /><h2 className="mt-4 font-heading text-2xl font-semibold">Nenhuma ocorrência encontrada</h2><p className="mt-2 text-muted-foreground">Quando houver relatos para este filtro, eles aparecerão aqui.</p></CardContent></Card>
      )}

      {view === "error" && (
        <Card className="mt-8 border-red-200"><CardContent className="flex min-h-72 flex-col items-center justify-center text-center"><AlertTriangle className="size-12 text-red-600" /><h2 className="mt-4 font-heading text-2xl font-semibold">Não foi possível carregar</h2><p className="mt-2 text-muted-foreground">Este é um estado de erro demonstrativo. Tente novamente.</p><Button className="mt-5" onClick={() => select("loading")}><RefreshCw /> Tentar novamente</Button></CardContent></Card>
      )}

      {view === "data" && (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {occurrences.map((item) => (
            <Card key={item.place} className="overflow-hidden transition-transform hover:-translate-y-1">
              <div className="h-2 bg-gradient-to-r from-cyan-600 to-cyan-300" />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div><h2 className="font-heading text-xl font-semibold">{item.place}</h2><p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" /> {item.region}, Itaúna/MG</p></div>
                  <Badge className={item.color}>Risco {item.risk}</Badge>
                </div>
                <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><CalendarClock className="size-4" /> Atualização simulada: {item.updated}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
