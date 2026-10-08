"use client";

import { useCallback, useState } from "react";
import { CircleAlert, ExternalLink } from "lucide-react";
import {
  OccurrenceMap,
  type MapNoticeLevel,
} from "@/components/occurrence-map";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { RoutePlanner, type RouteOverlay } from "@/components/route-planner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useOccurrences } from "@/hooks/use-occurrences";

export default function MapaPage() {
  const occurrences = useOccurrences();
  const [routes, setRoutes] = useState<RouteOverlay>();
  const [mapNotice, setMapNotice] = useState<{
    message: string;
    level: MapNoticeLevel;
  } | null>(null);
  const focusId =
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("foco");

  const handleMapNotice = useCallback(
    (message: string, level: MapNoticeLevel) => {
      setMapNotice({ message, level });
    },
    [],
  );

  return (
    <div className="page-shell py-6 md:py-8">
      <PageBreadcrumb
        items={[
          { href: "/", label: "Início" },
          { label: "Mapa interativo" },
        ]}
      />
      <div className="mt-4 mb-4 flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-heading text-3xl font-semibold tracking-tight text-slate-900">
          Mapa interativo
        </h1>
        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-800">
          Fontes e datas identificadas
        </Badge>
      </div>

      <Alert className="mb-4 border-amber-300 bg-amber-50">
        <CircleAlert className="text-amber-700" />
        <AlertTitle>Esta não é uma rota segura</AlertTitle>
        <AlertDescription>
          O traçado só sinaliza referências e relatos próximos. Proximidade não
          significa bloqueio atual. Não substitui a Defesa Civil.
        </AlertDescription>
      </Alert>

      <RoutePlanner occurrences={occurrences} onRoutes={setRoutes} />

      <div className="mt-4">
        {mapNotice && (
          <Alert
            variant={mapNotice.level === "error" ? "destructive" : "default"}
            className={
              mapNotice.level === "warning"
                ? "mb-3 border-amber-300 bg-amber-50"
                : "mb-3"
            }
          >
            <CircleAlert />
            <AlertTitle>
              {mapNotice.level === "error"
                ? "Mapa parcialmente indisponível"
                : "Base alternativa ativada"}
            </AlertTitle>
            <AlertDescription>{mapNotice.message}</AlertDescription>
          </Alert>
        )}
        <OccurrenceMap
          occurrences={occurrences}
          routeCoordinates={routes?.recommended}
          avoidedCoordinates={routes?.direct}
          focusId={focusId}
          onMapNotice={handleMapNotice}
          mapClassName="h-[min(72vh,760px)] min-h-[420px]"
        />
        <div className="mt-4 rounded-xl border bg-white p-4 text-sm leading-6 text-slate-600">
          <p className="font-semibold text-slate-900">Fonte e última verificação</p>
          <p>
            O ponto oficial documenta alagamentos históricos na Avenida Jove
            Soares/Prainha. Publicação da Prefeitura de 07/07/2017, consultada
            em 29/09/2026; marcador aproximado em um trecho da avenida.
          </p>
          <p className="mt-3">
            Em 07/10/2026, 291 vias urbanas sem nome correspondente no
            OpenStreetMap passaram a aparecer como traço escuro com o nome,
            a partir do Cadastro Nacional de Endereços do IBGE (Censo 2022).
            O eixo segue os endereços e é aproximado. A rota de carro continua
            nas ruas que o OpenStreetMap consegue percorrer.
          </p>
          <a
            href="https://www.itauna.mg.gov.br/portal/noticias/0/3/1530/equipe-do-governo-de-itauna-faz-vistoria-no-canal-da-jove-soares"
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-flex items-center gap-1 rounded-sm font-semibold text-cyan-800 underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700"
          >
            Abrir fonte oficial <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
