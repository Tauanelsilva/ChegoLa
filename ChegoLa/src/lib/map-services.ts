import type { Occurrence } from "@/lib/occurrences";

export type Coordinates = {
  latitude: number;
  longitude: number;
  label: string;
};

export type RouteResult = {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
};

const ITAUNA_VIEWBOX = "-44.66,-20.15,-44.49,-20.00";

async function fetchWithTimeout(
  input: string,
  init: RequestInit = {},
  timeoutMs = 12000,
) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Serviço respondeu ${response.status}`);
    return response;
  } finally {
    window.clearTimeout(timer);
  }
}

function parseCoordinates(value: string): Coordinates | null {
  const match = value
    .trim()
    .match(/^(-?\d{1,2}(?:\.\d+)?)\s*[,;]\s*(-?\d{1,3}(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }
  return { latitude, longitude, label: `${latitude}, ${longitude}` };
}

export async function geocodeLocation(query: string): Promise<Coordinates> {
  const coordinates = parseCoordinates(query);
  if (coordinates) return coordinates;

  const params = new URLSearchParams({
    q: `${query}, Itaúna, Minas Gerais, Brasil`,
    format: "jsonv2",
    limit: "1",
    countrycodes: "br",
    viewbox: ITAUNA_VIEWBOX,
    bounded: "1",
    "accept-language": "pt-BR",
  });
  const response = await fetchWithTimeout(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    { headers: { Accept: "application/json" } },
  );
  const results = (await response.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;
  if (!results.length) {
    throw new Error(
      "Local não encontrado em Itaúna. Detalhe o endereço ou use latitude, longitude.",
    );
  }
  return {
    latitude: Number(results[0].lat),
    longitude: Number(results[0].lon),
    label: results[0].display_name,
  };
}

export async function calculateRoute(
  origin: Coordinates,
  destination: Coordinates,
): Promise<RouteResult> {
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const response = await fetchWithTimeout(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&steps=false`,
  );
  const result = (await response.json()) as {
    code: string;
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: [number, number][] };
    }>;
  };
  if (result.code !== "Ok" || !result.routes?.length) {
    throw new Error("O serviço público não encontrou uma rota entre os pontos.");
  }
  const route = result.routes[0];
  return {
    coordinates: route.geometry.coordinates,
    distanceKm: route.distance / 1000,
    durationMinutes: route.duration / 60,
  };
}

function haversineKm(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const radius = 6371;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const deltaLatitude = toRadians(latitudeB - latitudeA);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(deltaLongitude / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function occurrencesNearRoute(
  occurrences: Occurrence[],
  routeCoordinates: [number, number][],
  thresholdKm = 0.2,
) {
  return occurrences.filter((occurrence) =>
    routeCoordinates.some(
      ([longitude, latitude]) =>
        haversineKm(
          occurrence.latitude,
          occurrence.longitude,
          latitude,
          longitude,
        ) <= thresholdKm,
    ),
  );
}

