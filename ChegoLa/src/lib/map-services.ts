import type { Occurrence } from "@/lib/occurrences";

export type Coordinates = {
  latitude: number;
  longitude: number;
  label: string;
  approximate?: boolean;
  matchType?: "exact" | "approximate" | "coordinates";
};

export type RouteResult = {
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
};

export async function fetchWithTimeout(
  input: string,
  serviceName: string,
  init: RequestInit = {},
  timeoutMs = 12000,
) {
  const controller = new AbortController();
  const timer = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = (await response
        .clone()
        .json()
        .catch(() => null)) as { error?: string } | null;
      throw new Error(
        payload?.error ??
          `${serviceName} respondeu com HTTP ${response.status}. Tente novamente mais tarde.`,
      );
    }
    return response;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `${serviceName} demorou mais de ${Math.round(timeoutMs / 1000)} segundos para responder.`,
      );
    }
    if (error instanceof TypeError) {
      throw new Error(
        `Não foi possível acessar ${serviceName}. Verifique a conexão, bloqueios de rede ou CORS.`,
      );
    }
    throw error;
  } finally {
    globalThis.clearTimeout(timer);
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
  return {
    latitude,
    longitude,
    label: `${latitude}, ${longitude}`,
    approximate: false,
    matchType: "coordinates",
  };
}

export async function geocodeLocation(query: string): Promise<Coordinates> {
  const coordinates = parseCoordinates(query);
  if (coordinates) return coordinates;

  const params = new URLSearchParams({ q: query });
  const response = await fetchWithTimeout(
    `/api/geocode?${params.toString()}`,
    "geocodificação do Chegolá?",
    { headers: { Accept: "application/json" } },
    30000,
  );
  const payload = (await response.json()) as {
    result: {
      latitude: number;
      longitude: number;
      label: string;
      approximate: boolean;
      matchType: "exact" | "approximate";
    };
  };
  return {
    latitude: payload.result.latitude,
    longitude: payload.result.longitude,
    label: payload.result.label,
    approximate: payload.result.approximate,
    matchType: payload.result.matchType,
  };
}

export function distanceKm(
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

function distanceToSegmentKm(
  latitude: number,
  longitude: number,
  start: [number, number],
  end: [number, number],
) {
  const kx = Math.cos((latitude * Math.PI) / 180) * 111.32;
  const ky = 110.574;
  const px = longitude * kx;
  const py = latitude * ky;
  const ax = start[0] * kx;
  const ay = start[1] * ky;
  const bx = end[0] * kx;
  const by = end[1] * ky;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSq = dx * dx + dy * dy;
  const ratio =
    lengthSq === 0
      ? 0
      : Math.min(1, Math.max(0, ((px - ax) * dx + (py - ay) * dy) / lengthSq));
  return Math.hypot(px - (ax + ratio * dx), py - (ay + ratio * dy));
}

export function distanceToRouteKm(
  latitude: number,
  longitude: number,
  route: [number, number][],
) {
  if (route.length === 0) return Number.POSITIVE_INFINITY;
  if (route.length === 1) {
    return distanceKm(latitude, longitude, route[0][1], route[0][0]);
  }
  let best = Number.POSITIVE_INFINITY;
  for (let index = 1; index < route.length; index += 1) {
    best = Math.min(
      best,
      distanceToSegmentKm(latitude, longitude, route[index - 1], route[index]),
    );
  }
  return best;
}

export function occurrencesNearRoute(
  occurrences: Occurrence[],
  routeCoordinates: [number, number][],
  thresholdKm = 0.2,
) {
  return occurrences.filter(
    (occurrence) =>
      distanceToRouteKm(
        occurrence.latitude,
        occurrence.longitude,
        routeCoordinates,
      ) <= thresholdKm,
  );
}

