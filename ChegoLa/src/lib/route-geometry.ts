import { distanceKm } from "@/lib/map-services";
import type { Occurrence } from "@/lib/occurrences";
import type { RoutePoint } from "@/lib/osrm-route";

const DETOUR_KM = 0.7;

function bearingDegrees(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const lat1 = toRadians(latitudeA);
  const lat2 = toRadians(latitudeB);
  const deltaLongitude = toRadians(longitudeB - longitudeA);
  const y = Math.sin(deltaLongitude) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLongitude);
  return (Math.atan2(y, x) * 180) / Math.PI;
}

function offsetKm(
  latitude: number,
  longitude: number,
  bearing: number,
  distanceKmValue: number,
): RoutePoint {
  const radius = 6371;
  const angular = distanceKmValue / radius;
  const theta = (bearing * Math.PI) / 180;
  const lat1 = (latitude * Math.PI) / 180;
  const lon1 = (longitude * Math.PI) / 180;
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angular) +
      Math.cos(lat1) * Math.sin(angular) * Math.cos(theta),
  );
  const lon2 =
    lon1 +
    Math.atan2(
      Math.sin(theta) * Math.sin(angular) * Math.cos(lat1),
      Math.cos(angular) - Math.sin(lat1) * Math.sin(lat2),
    );
  return {
    latitude: (lat2 * 180) / Math.PI,
    longitude: (((lon2 * 180) / Math.PI + 540) % 360) - 180,
  };
}

export function detourPoints(
  route: [number, number][],
  hazards: Occurrence[],
): RoutePoint[] {
  if (hazards.length === 0 || route.length < 2) return [];

  const anchor = hazards[Math.floor(hazards.length / 2)];
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  route.forEach(([longitude, latitude], index) => {
    const distance = distanceKm(
      anchor.latitude,
      anchor.longitude,
      latitude,
      longitude,
    );
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  const nextIndex = Math.min(closestIndex + 1, route.length - 1);
  const previousIndex = Math.max(closestIndex - 1, 0);
  const from = closestIndex === route.length - 1 ? route[previousIndex] : route[closestIndex];
  const to = closestIndex === route.length - 1 ? route[closestIndex] : route[nextIndex];
  const bearing = bearingDegrees(from[1], from[0], to[1], to[0]);

  return [90, -90].map((turn) =>
    offsetKm(anchor.latitude, anchor.longitude, bearing + turn, DETOUR_KM),
  );
}
