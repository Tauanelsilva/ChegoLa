"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownUp, CircleAlert, ExternalLink, MapPin, Navigation } from "lucide-react";
import {
  OccurrenceMap,
  type MapNoticeLevel,
} from "@/components/occurrence-map";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateRoute,
  geocodeLocation,
  occurrencesNearRoute,
  type Coordinates,
  type RouteResult,
} from "@/lib/map-services";
import {
  loadAllOccurrences,
  OCCURRENCES_CHANGED_EVENT,
  type Occurrence,
} from "@/lib/occurrences";

type RouteStatus = "idle" | "loading" | "ready" | "error";

export default function MapaPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<RouteStatus>("idle");
  const [error, setError] = useState("");
  const [mapNotice, setMapNotice] = useState<{
    message: string;
    level: MapNoticeLevel;
  } | null>(null);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [resolvedLocations, setResolvedLocations] = useState<{
    origin?: Coordinates;
    destination?: Coordinates;
  } | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [nearbyOccurrences, setNearbyOccurrences] = useState<Occurrence[]>([]);

  useEffect(() => {
    const refresh = () => setOccurrences(loadAllOccurrences().occurrences);
    refresh();
    window.addEventListener(OCCURRENCES_CHANGED_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(OCCURRENCES_CHANGED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const handleMapNotice = useCallback(
    (message: string, level: MapNoticeLevel) => {
      setMapNotice({ message, level });
    },
    [],
  );

  async function calculate() {
    if (!origin.trim() || !destination.trim()) {
      setError("Preencha origem e destino.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    setRoute(null);
    setResolvedLocations(null);
    setNearbyOccurrences([]);

    try {
      const resolvedOrigin = await geocodeLocation(origin);
      setResolvedLocations({ origin: resolvedOrigin });
      const resolvedDestination = await geocodeLocation(destination);
      setResolvedLocations({
        origin: resolvedOrigin,
        destination: resolvedDestination,
      });
      const result = await calculateRoute(
        resolvedOrigin,
        resolvedDestination,
      );
      setRoute(result);
      setNearbyOccurrences(
        occurrencesNearRoute(occurrences, result.coordinates),
      );
      setStatus("ready");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível calcular a rota agora.",
      );
      setStatus("error");
    }
  }

  function swap() {
    setOrigin(destination);
    setDestination(origin);
    setRoute(null);
    setResolvedLocations(null);
    setStatus("idle");
  }

  return (
    <div className="page-shell py-10">
      <div className="mb-8">
        <Badge
          variant="outline"
          className="mb-3 border-amber-300 bg-amber-50 text-amber-800"
        >
          Mapa real • fontes e datas identificadas
        </Badge>
        <h1 className="section-title">Mapa interativo</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Consulte a referência histórica publicada pela Prefeitura e relatos
          armazenados neste navegador. O resultado não representa condições em
          tempo real.
        </p>
      </div>

      <Alert className="mb-5 border-amber-300 bg-amber-50">
        <CircleAlert className="text-amber-700" />
        <AlertTitle>Esta não é uma rota segura</AlertTitle>
        <AlertDescription>
          O sistema apenas sinaliza referências e relatos cadastrados próximos
          ao traçado. Proximidade não significa bloqueio atual, nem ausência de
          risco. Não substitui orientações da Defesa Civil.
        </AlertDescription>
      </Alert>

      <div className="grid gap-5 lg:grid-cols-[370px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="origin">Origem em Itaúna</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 size-5 text-cyan-700" />
                <Input
                  id="origin"
                  className="pl-10"
                  value={origin}
                  onChange={(event) => setOrigin(event.target.value)}
                  placeholder="Rua, número, bairro ou ponto de interesse"
                  autoComplete="street-address"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={swap}
            >
              <ArrowDownUp /> Inverter pontos
            </Button>
            <div className="space-y-2">
              <Label htmlFor="destination">Destino em Itaúna</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-2.5 size-5 text-amber-600" />
                <Input
                  id="destination"
                  className="pl-10"
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  placeholder="Outro endereço em Itaúna"
                  autoComplete="street-address"
                />
              </div>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Se um endereço não for encontrado, use coordenadas no formato
              <span className="font-semibold"> -20.0756, -44.5764</span>.
              A busca acontece somente ao calcular, sem autocomplete contínuo.
            </p>
            <Button
              className="w-full bg-cyan-700 hover:bg-cyan-800"
              onClick={calculate}
              disabled={status === "loading"}
            >
              {status === "loading"
                ? "Buscando locais e rota…"
                : "Calcular rota"}
            </Button>

            {status === "error" && (
              <Alert variant="destructive" role="alert">
                <CircleAlert />
                <AlertTitle>Não foi possível calcular</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {resolvedLocations && (
              <div
                className="space-y-2 rounded-lg border bg-slate-50 p-3 text-xs leading-5 text-slate-700"
                aria-live="polite"
              >
                {resolvedLocations.origin && (
                  <p>
                    <strong>Origem encontrada:</strong>{" "}
                    {resolvedLocations.origin.label}
                    {formatMatchType(resolvedLocations.origin)}
                  </p>
                )}
                {resolvedLocations.destination && (
                  <p>
                    <strong>Destino encontrado:</strong>{" "}
                    {resolvedLocations.destination.label}
                    {formatMatchType(resolvedLocations.destination)}
                  </p>
                )}
              </div>
            )}

            {status === "ready" && route && (
              <Alert
                className={
                  nearbyOccurrences.length
                    ? "border-amber-300 bg-amber-50"
                    : "border-cyan-200 bg-cyan-50"
                }
              >
                <Navigation className="text-cyan-800" />
                <AlertTitle>Rota calculada</AlertTitle>
                <AlertDescription>
                  {route.distanceKm.toFixed(1).replace(".", ",")} km · cerca de{" "}
                  {Math.round(route.durationMinutes)} min.
                  {nearbyOccurrences.length ? (
                    <>
                      {" "}
                      Passa a até 200 m de {nearbyOccurrences.length} ponto
                      {nearbyOccurrences.length > 1 ? "s cadastrados" : " cadastrado"}:{" "}
                      {nearbyOccurrences
                        .map((occurrence) => occurrence.place)
                        .join(", ")}.
                    </>
                  ) : (
                    " Nenhum ponto cadastrado foi encontrado a até 200 m do traçado."
                  )}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs leading-5 text-muted-foreground">
              Geocodificação: Route Handler do Chegolá? com
              Nominatim/OpenStreetMap, normalização, variantes, limite municipal,
              cache e controle de frequência. A cobertura depende dos endereços
              cadastrados no OpenStreetMap. Rota: servidor público OSRM. Serviços
              sem garantia de disponibilidade, destinados a esta demonstração
              de baixo volume.
            </p>
          </CardContent>
        </Card>

        <div>
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
            routeCoordinates={route?.coordinates}
            onMapNotice={handleMapNotice}
          />
          <div className="mt-4 rounded-xl border bg-white p-4 text-sm leading-6 text-slate-600">
            <p className="font-semibold text-slate-900">
              Fonte e última verificação
            </p>
            <p>
              O ponto oficial exibido documenta alagamentos históricos na
              Avenida Jove Soares/Prainha. Publicação da Prefeitura de
              07/07/2017, consultada em 29/09/2026; marcador aproximado em um
              trecho geocodificado da avenida.
            </p>
            <a
              href="https://www.itauna.mg.gov.br/portal/noticias/0/3/1530/equipe-do-governo-de-itauna-faz-vistoria-no-canal-da-jove-soares"
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex items-center gap-1 font-semibold text-cyan-800 underline underline-offset-2"
            >
              Abrir fonte oficial <ExternalLink className="size-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMatchType(location: Coordinates) {
  if (location.matchType === "coordinates") return " (coordenadas informadas)";
  return location.approximate
    ? " (resultado aproximado)"
    : " (correspondência textual exata)";
}
