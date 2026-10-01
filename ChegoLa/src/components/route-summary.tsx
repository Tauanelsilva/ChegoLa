import { Navigation } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { RoutePlan } from "@/lib/plan-route";
import type { RouteResult } from "@/lib/map-services";

type RouteSummaryProps = {
  plan: RoutePlan;
};

function formatRoute(route: RouteResult) {
  const distance = route.distanceKm.toFixed(1).replace(".", ",");
  const minutes = Math.round(route.durationMinutes);
  return `${distance} km · cerca de ${minutes} min`;
}

function placeList(places: string[]) {
  return places.join(", ");
}

export function RouteSummary({ plan }: RouteSummaryProps) {
  const directPlaces = plan.hazardsOnDirect.map((item) => item.place);
  const remainingPlaces = plan.hazardsOnRecommended.map((item) => item.place);
  const avoided = plan.direct !== null && remainingPlaces.length === 0;
  const partial = plan.direct !== null && remainingPlaces.length > 0;
  const blockedOnly = plan.direct === null && directPlaces.length > 0;

  return (
    <Alert
      className={
        avoided
          ? "border-cyan-200 bg-cyan-50"
          : directPlaces.length
            ? "border-amber-300 bg-amber-50"
            : "border-cyan-200 bg-cyan-50"
      }
    >
      <Navigation className="text-cyan-800" />
      <AlertTitle>
        {avoided ? "Rota alternativa" : partial ? "Desvio parcial" : "Rota calculada"}
      </AlertTitle>
      <AlertDescription>
        <p>Traçado sugerido: {formatRoute(plan.recommended)}.</p>
        {avoided && plan.direct && (
          <p className="mt-2">
            O caminho mais curto ({formatRoute(plan.direct)}) passa a até 200 m de{" "}
            {placeList(directPlaces)}. A linha contínua se afasta desses pontos. A
            linha âmbar tracejada é o caminho direto.
          </p>
        )}
        {partial && (
          <p className="mt-2">
            O desvio ainda passa a até 200 m de {placeList(remainingPlaces)}. Entre as
            opções encontradas, esta é a que se aproxima de menos pontos.
          </p>
        )}
        {blockedOnly && (
          <p className="mt-2">
            Este traçado passa a até 200 m de {placeList(directPlaces)} e não encontramos
            outro caminho que se afaste deles.
          </p>
        )}
        {!directPlaces.length && (
          <p className="mt-2">Nenhum ponto cadastrado foi encontrado a até 200 m do traçado.</p>
        )}
        <p className="mt-2">
          Proximidade não confirma alagamento agora e não substitui a Defesa Civil.
        </p>
      </AlertDescription>
    </Alert>
  );
}
