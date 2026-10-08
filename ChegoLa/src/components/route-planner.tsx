"use client";

import { ArrowDownUp, CircleAlert, MapPin, Navigation } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";
import { RouteSummary } from "@/components/route-summary";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { geocodeLocation, type Coordinates } from "@/lib/map-services";
import type { Occurrence } from "@/lib/occurrences";
import { planRoute, type RoutePlan } from "@/lib/plan-route";

type RouteStatus = "idle" | "loading" | "ready" | "error";

export type RouteOverlay = {
  recommended: [number, number][];
  direct: [number, number][];
};

type RoutePlannerProps = {
  occurrences: Occurrence[];
  onRoutes: (overlay: RouteOverlay | undefined) => void;
};

export function RoutePlanner({ occurrences, onRoutes }: RoutePlannerProps) {
  const requestRef = useRef(0);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<RouteStatus>("idle");
  const [error, setError] = useState("");
  const [plan, setPlan] = useState<RoutePlan | null>(null);
  const [resolved, setResolved] = useState<{
    origin?: Coordinates;
    destination?: Coordinates;
  } | null>(null);

  function clearRoute() {
    setPlan(null);
    setResolved(null);
    setStatus("idle");
    onRoutes(undefined);
  }

  function swap() {
    setOrigin(destination);
    setDestination(origin);
    clearRoute();
  }

  async function calculate() {
    if (!origin.trim() || !destination.trim()) {
      setError("Preencha origem e destino.");
      setStatus("error");
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    setStatus("loading");
    setError("");
    setPlan(null);
    setResolved(null);
    onRoutes(undefined);

    try {
      const resolvedOrigin = await geocodeLocation(origin);
      if (requestRef.current !== requestId) return;
      setResolved({ origin: resolvedOrigin });
      const resolvedDestination = await geocodeLocation(destination);
      if (requestRef.current !== requestId) return;
      setResolved({ origin: resolvedOrigin, destination: resolvedDestination });
      const nextPlan = await planRoute(resolvedOrigin, resolvedDestination, occurrences);
      if (requestRef.current !== requestId) return;
      setPlan(nextPlan);
      onRoutes({
        recommended: nextPlan.recommended.coordinates,
        direct: nextPlan.direct?.coordinates ?? [],
      });
      setStatus("ready");
    } catch (caught) {
      if (requestRef.current !== requestId) return;
      setError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível calcular a rota agora.",
      );
      setStatus("error");
    }
  }

  return (
    <form
      className="space-y-4 rounded-2xl border bg-white p-4 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        void calculate();
      }}
    >
      <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto] lg:items-end">
        <Field
          id="origin"
          label="De"
          icon={<MapPin className="size-5 text-cyan-700" />}
          value={origin}
          onChange={setOrigin}
          placeholder="Origem em Itaúna"
        />
        <Button type="button" variant="outline" className="min-h-11" onClick={swap}>
          <ArrowDownUp /> <span className="lg:sr-only">Inverter pontos</span>
        </Button>
        <Field
          id="destination"
          label="Para"
          icon={<Navigation className="size-5 text-amber-600" />}
          value={destination}
          onChange={setDestination}
          placeholder="Destino em Itaúna"
        />
        <Button
          type="submit"
          className="min-h-11 bg-cyan-700 hover:bg-cyan-800"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Calculando…" : "Calcular rota"}
        </Button>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">
        Endereço em Itaúna ou coordenadas no formato
        <span className="font-semibold"> -20.0756, -44.5764</span>. “Prainha” é
        tratado como o Bairro das Graças. Se o caminho passar a até 200 m de um
        ponto cadastrado, buscamos um desvio.
      </p>

      {status === "error" && (
        <Alert variant="destructive" role="alert">
          <CircleAlert />
          <AlertTitle>Não foi possível calcular</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {resolved && (
        <div className="space-y-1 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-700" aria-live="polite">
          {resolved.origin && <p><strong>Origem encontrada:</strong> {resolved.origin.label}{formatMatch(resolved.origin)}</p>}
          {resolved.destination && <p><strong>Destino encontrado:</strong> {resolved.destination.label}{formatMatch(resolved.destination)}</p>}
        </div>
      )}

      {status === "ready" && plan && <RouteSummary plan={plan} />}
    </form>
  );
}

type FieldProps = {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

function Field({ id, label, icon, value, onChange, placeholder }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-3">{icon}</span>
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete="street-address"
          className="h-11 pl-10"
        />
      </div>
    </div>
  );
}

function formatMatch(location: Coordinates) {
  if (location.matchType === "coordinates") return " (coordenadas informadas)";
  return location.approximate ? " (resultado aproximado)" : " (correspondência textual exata)";
}
