import {
  distanceToRouteKm,
  occurrencesNearRoute,
  type Coordinates,
  type RouteResult,
} from "@/lib/map-services";
import type { Occurrence } from "@/lib/occurrences";
import { fetchDrivingRoutes, type RoutePoint } from "@/lib/osrm-route";
import { detourPoints } from "@/lib/route-geometry";

const HAZARD_THRESHOLD_KM = 0.2;
const CLEARANCE_GAIN_KM = 0.05;
const DETOUR_CONCURRENCY = 3;

export type RoutePlan = {
  recommended: RouteResult;
  direct: RouteResult | null;
  hazardsOnDirect: Occurrence[];
  hazardsOnRecommended: Occurrence[];
};

type ScoredRoute = {
  route: RouteResult;
  hazards: Occurrence[];
  clearanceKm: number;
};

type FetchRoutes = (
  points: RoutePoint[],
  alternatives?: number,
  attempts?: number,
) => Promise<RouteResult[]>;

function assess(route: RouteResult, occurrences: Occurrence[]): ScoredRoute {
  const clearanceKm = occurrences.reduce(
    (nearest, occurrence) =>
      Math.min(
        nearest,
        distanceToRouteKm(
          occurrence.latitude,
          occurrence.longitude,
          route.coordinates,
        ),
      ),
    Number.POSITIVE_INFINITY,
  );
  return {
    route,
    hazards: occurrencesNearRoute(occurrences, route.coordinates, HAZARD_THRESHOLD_KM),
    clearanceKm,
  };
}

function prefer(left: ScoredRoute, right: ScoredRoute) {
  const leftBlocked = left.hazards.length > 0;
  const rightBlocked = right.hazards.length > 0;
  if (leftBlocked !== rightBlocked) return leftBlocked ? 1 : -1;
  if (leftBlocked && rightBlocked) {
    if (left.hazards.length !== right.hazards.length) {
      return left.hazards.length - right.hazards.length;
    }
    if (Math.abs(left.clearanceKm - right.clearanceKm) > CLEARANCE_GAIN_KM) {
      return right.clearanceKm - left.clearanceKm;
    }
  }
  return left.route.durationMinutes - right.route.durationMinutes;
}

function leavesTheBlockedRoad(best: ScoredRoute, fastest: ScoredRoute) {
  return (
    best.hazards.length < fastest.hazards.length ||
    best.clearanceKm > fastest.clearanceKm + CLEARANCE_GAIN_KM ||
    Math.abs(best.route.distanceKm - fastest.route.distanceKm) > 0.12
  );
}

async function mapLimited<T, R>(
  items: T[],
  limit: number,
  worker: (item: T) => Promise<R>,
) {
  const results = new Array<R>(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index]);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => run()),
  );
  return results;
}

async function routesAroundHazards(
  origin: Coordinates,
  destination: Coordinates,
  direct: ScoredRoute,
  fetchRoutes: FetchRoutes,
) {
  const points = detourPoints(direct.route.coordinates, direct.hazards);
  const settled = await mapLimited(points, DETOUR_CONCURRENCY, async (point) => {
    try {
      const [route] = await fetchRoutes([origin, point, destination], 0, 1);
      return route ?? null;
    } catch {
      return null;
    }
  });
  return settled.filter((route): route is RouteResult => route !== null);
}

function toPlan(best: ScoredRoute, fastest: ScoredRoute): RoutePlan {
  const changed = leavesTheBlockedRoad(best, fastest);
  return {
    recommended: best.route,
    direct: changed ? fastest.route : null,
    hazardsOnDirect: fastest.hazards,
    hazardsOnRecommended: best.hazards,
  };
}

export async function planRoute(
  origin: Coordinates,
  destination: Coordinates,
  occurrences: Occurrence[],
  fetchRoutes: FetchRoutes = fetchDrivingRoutes,
): Promise<RoutePlan> {
  const candidates = await fetchRoutes([origin, destination], 2);
  const ranked = candidates.map((route) => assess(route, occurrences)).sort(prefer);
  const fastest = candidates
    .map((route) => assess(route, occurrences))
    .sort((left, right) => left.route.durationMinutes - right.route.durationMinutes)[0];
  const clear = ranked.find((item) => item.hazards.length === 0);
  if (clear) return toPlan(clear, fastest);

  const detours = await routesAroundHazards(origin, destination, fastest, fetchRoutes);
  const best = [fastest.route, ...detours]
    .map((route) => assess(route, occurrences))
    .sort(prefer)[0];
  return toPlan(best, fastest);
}
