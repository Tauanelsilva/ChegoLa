import {
  occurrencesNearRoute,
  type Coordinates,
  type RouteResult,
} from "@/lib/map-services";
import type { Occurrence } from "@/lib/occurrences";
import { fetchDrivingRoutes } from "@/lib/osrm-route";
import { detourPoints } from "@/lib/route-geometry";

const HAZARD_THRESHOLD_KM = 0.2;

export type RoutePlan = {
  recommended: RouteResult;
  direct: RouteResult | null;
  hazardsOnDirect: Occurrence[];
  hazardsOnRecommended: Occurrence[];
};

type ScoredRoute = {
  route: RouteResult;
  hazards: Occurrence[];
};

function score(route: RouteResult, occurrences: Occurrence[]): ScoredRoute {
  return {
    route,
    hazards: occurrencesNearRoute(occurrences, route.coordinates, HAZARD_THRESHOLD_KM),
  };
}

function bySafety(left: ScoredRoute, right: ScoredRoute) {
  if (left.hazards.length !== right.hazards.length) {
    return left.hazards.length - right.hazards.length;
  }
  return left.route.durationMinutes - right.route.durationMinutes;
}

function sameTrace(left: RouteResult, right: RouteResult) {
  return (
    left.distanceKm === right.distanceKm &&
    left.coordinates.length === right.coordinates.length
  );
}

async function routesAroundHazards(
  origin: Coordinates,
  destination: Coordinates,
  direct: ScoredRoute,
) {
  const points = detourPoints(direct.route.coordinates, direct.hazards);
  const settled = await Promise.all(
    points.map(async (point) => {
      try {
        const [route] = await fetchDrivingRoutes([origin, point, destination], 0, 1);
        return route ?? null;
      } catch {
        return null;
      }
    }),
  );
  return settled.filter((route): route is RouteResult => route !== null);
}

export async function planRoute(
  origin: Coordinates,
  destination: Coordinates,
  occurrences: Occurrence[],
): Promise<RoutePlan> {
  const candidates = await fetchDrivingRoutes([origin, destination], 2);
  const ranked = candidates
    .map((route) => score(route, occurrences))
    .sort(bySafety);
  const fastest = candidates
    .map((route) => score(route, occurrences))
    .sort((left, right) => left.route.durationMinutes - right.route.durationMinutes)[0];

  const clear = ranked.find((item) => item.hazards.length === 0);
  if (clear) {
    const avoided = fastest.hazards.length > 0 && !sameTrace(clear.route, fastest.route);
    return {
      recommended: clear.route,
      direct: avoided ? fastest.route : null,
      hazardsOnDirect: fastest.hazards,
      hazardsOnRecommended: [],
    };
  }

  const detours = await routesAroundHazards(origin, destination, fastest);
  const best = [fastest.route, ...detours]
    .map((route) => score(route, occurrences))
    .sort(bySafety)[0];
  const changed = !sameTrace(best.route, fastest.route);

  return {
    recommended: best.route,
    direct: changed ? fastest.route : null,
    hazardsOnDirect: fastest.hazards,
    hazardsOnRecommended: best.hazards,
  };
}
