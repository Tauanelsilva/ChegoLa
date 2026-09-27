"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDownUp, CircleAlert, MapPin, Navigation } from "lucide-react";
import { OccurrenceMap } from "@/components/occurrence-map";
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
  const [mapError, setMapError] = useState("");
  const [route, setRoute] = useState<RouteResult | null>(null);
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

  const handleMapError = useCallback((message: string) => {
    setMapError(message);
  }, []);

  async function calculate() {
    if (!origin.trim() || !destination.trim()) {
      setError("Preencha origem e destino.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");
    setRoute(null);
    setNearbyOccurrences([]);

    try {
      const resolvedOrigin = await geocodeLocation(origin);
      await new Promise((resolve) => window.setTimeout(resolve, 1100));
      const resolvedDestination = await geocodeLocation(destination);
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
    setStatus("idle");
  }

  return (
    <div className="page-shell py-10">
      <div className="mb-8">
        <Badge
          variant="outline"
          className="mb-3 border-amber-300 bg-amber-50 text-amber-800"
        >
          Mapa real • dados colaborativos não verificados
        </Badge>
        <h1 className="section-title">Mapa interativo</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Consulte pontos armazenados neste navegador e calcule uma rota
          demonstrativa com serviços públicos. O resultado não considera
          condições em tempo real.
        </p>
      </div>

      <Alert className="mb-5 border-amber-300 bg-amber-50">
        <CircleAlert className="text-amber-700" />
        <AlertTitle>Esta não é uma rota segura</AlertTitle>
        <AlertDescription>
          O sistema apenas sinaliza ocorrências cadastradas próximas ao traçado.
          Não substitui orientações da Defesa Civil, trânsito ou emergência.
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
                  placeholder="Ex.: Praça da Matriz"
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
                  placeholder="Ex.: Bairro Santanense"
                  autoComplete="street-address"
                />
              </div>
            </div>
            <p className="text-xs leading-5 text-muted-foreground">
              Se um endereço não for encontrado, use coordenadas no formato
              <span className="font-semibold"> -20.0756, -44.5764</span>.
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
                      Passa a até 200 m de {nearbyOccurrences.length} ocorrência
                      {nearbyOccurrences.length > 1 ? "s" : ""}:{" "}
                      {nearbyOccurrences
                        .map((occurrence) => occurrence.place)
                        .join(", ")}.
                    </>
                  ) : (
                    " Nenhuma ocorrência cadastrada foi encontrada a até 200 m do traçado."
                  )}
                </AlertDescription>
              </Alert>
            )}

            <p className="text-xs leading-5 text-muted-foreground">
              Geocodificação: Nominatim/OpenStreetMap. Rota: servidor público
              OSRM. Serviços sem garantia de disponibilidade, destinados a esta
              demonstração de baixo volume.
            </p>
          </CardContent>
        </Card>

        <div>
          {mapError && (
            <Alert variant="destructive" className="mb-3">
              <CircleAlert />
              <AlertTitle>Mapa indisponível</AlertTitle>
              <AlertDescription>{mapError}</AlertDescription>
            </Alert>
          )}
          <OccurrenceMap
            occurrences={occurrences}
            routeCoordinates={route?.coordinates}
            onMapError={handleMapError}
          />
        </div>
      </div>
    </div>
  );
}
