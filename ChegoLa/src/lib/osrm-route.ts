import { fetchWithTimeout, type RouteResult } from "@/lib/map-services";

export type RoutePoint = {
  latitude: number;
  longitude: number;
};

type OsrmRoute = {
  distance: number;
  duration: number;
  geometry: { coordinates: [number, number][] };
};

type OsrmResponse = {
  code: string;
  routes?: OsrmRoute[];
};

function sleep(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isRetryable(error: unknown) {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("demorou mais") ||
    error.message.includes("Não foi possível acessar") ||
    /HTTP 5\d\d/.test(error.message)
  );
}

function toRoute(route: OsrmRoute): RouteResult {
  return {
    coordinates: route.geometry.coordinates,
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
  };
}

export async function fetchDrivingRoutes(
  points: RoutePoint[],
  alternatives = 0,
  attempts = 3,
): Promise<RouteResult[]> {
  const path = points
    .map((point) => `${point.longitude},${point.latitude}`)
    .join(";");
  const params = new URLSearchParams({
    overview: "full",
    geometries: "geojson",
    steps: "false",
    alternatives: String(alternatives),
  });
  const url = `https://router.project-osrm.org/route/v1/driving/${path}?${params}`;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetchWithTimeout(url, "OSRM público");
      const result = (await response.json()) as OsrmResponse;
      if (result.code !== "Ok" || !result.routes?.length) {
        throw new Error("O serviço público não encontrou uma rota entre os pontos.");
      }
      return result.routes.map(toRoute);
    } catch (error) {
      lastError = error;
      const canRetry = isRetryable(error) && attempt < attempts - 1;
      if (!canRetry) break;
      const backoff = 400 * 2 ** attempt;
      const jitter = Math.floor(Math.random() * 250);
      await sleep(backoff + jitter);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Não foi possível calcular a rota agora.");
}
