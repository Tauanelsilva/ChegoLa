import assert from "node:assert/strict";
import { test } from "node:test";
import {
  distanceToRouteKm,
  occurrencesNearRoute,
} from "@/lib/map-services";
import {
  dropUnmappedNeighborhood,
  findSupplementalStreet,
} from "@/lib/local-streets";
import { INITIAL_OCCURRENCES } from "@/lib/occurrences";
import { planRoute } from "@/lib/plan-route";
import { detourPoints } from "@/lib/route-geometry";
import { SUPPLEMENTAL_STREETS } from "@/lib/supplemental-streets";
import type { RouteResult } from "@/lib/map-services";
import type { RoutePoint } from "@/lib/osrm-route";

const MISSING_PRAINHA_STREETS = [
  "Praça Dona Macrina",
  "Praça Meroveu de Souza",
  "Praça Modestino Franco",
  "Rua Antônio Macedo",
  "Rua Bauru",
  "Rua Benfica Magalhães",
  "Rua Gioconda Corradi",
  "Rua Ildeu Guimarães",
  "Rua José Luiz Calambau",
  "Rua Padre Domingues Maia",
  "Rua São Miguel",
  "Vila Ceci Gomide",
];

test("inclui vias urbanas que o OpenStreetMap não nomeia e deixa de fora as que já estão no mapa", () => {
  const names = new Set(SUPPLEMENTAL_STREETS.map((street) => street.name));
  for (const name of MISSING_PRAINHA_STREETS) assert.ok(names.has(name), name);
  assert.equal(names.has("Avenida Jove Soares"), false);
  assert.ok(SUPPLEMENTAL_STREETS.length > MISSING_PRAINHA_STREETS.length);
  for (const street of SUPPLEMENTAL_STREETS) {
    for (const line of street.lines) {
      assert.ok(line.length >= 2);
      for (const [longitude, latitude] of line) {
        assert.ok(latitude < -19.93 && latitude > -20.23);
        assert.ok(longitude < -44.44 && longitude > -44.73);
      }
    }
  }
});

test("encontra rua da Prainha pelo nome local e pelo apelido dos Correios", () => {
  const miguel = findSupplementalStreet("Rua São Miguel, Prainha");
  assert.equal(miguel?.name, "Rua São Miguel");
  assert.match(miguel?.label ?? "", /IBGE/);

  assert.equal(
    findSupplementalStreet("Praça Merovel de Souza")?.name,
    "Praça Meroveu de Souza",
  );
  assert.equal(
    findSupplementalStreet("Rua Padre Domingos Maia, Itaúna")?.name,
    "Rua Padre Domingues Maia",
  );
  assert.equal(
    findSupplementalStreet("Rua Benfica Alves Magalhães")?.name,
    "Rua Benfica Magalhães",
  );
  assert.equal(findSupplementalStreet("Avenida Jove Soares") , null);
  assert.equal(findSupplementalStreet("Prainha")?.name, "Prainha");
});

test("tira Prainha da consulta porque o mapa público usa Bairro das Graças", () => {
  assert.equal(
    dropUnmappedNeighborhood("Rua Santana, Prainha"),
    "Rua Santana",
  );
  assert.equal(
    dropUnmappedNeighborhood("Avenida Jove Soares Prainha"),
    "Avenida Jove Soares",
  );
});

test("mede a proximidade pelo trecho, não só pelos vértices", () => {
  const hazard = INITIAL_OCCURRENCES[0];
  const route: [number, number][] = [
    [hazard.longitude, hazard.latitude - 0.02],
    [hazard.longitude, hazard.latitude + 0.02],
  ];
  assert.ok(distanceToRouteKm(hazard.latitude, hazard.longitude, route) < 0.02);
  assert.equal(occurrencesNearRoute([hazard], route).length, 1);
});

test("recalcula por um desvio que sai da via bloqueada", async () => {
  const hazard = INITIAL_OCCURRENCES[0];
  const direct: RouteResult = {
    coordinates: [
      [hazard.longitude, hazard.latitude - 0.01],
      [hazard.longitude, hazard.latitude],
      [hazard.longitude, hazard.latitude + 0.01],
    ],
    distanceKm: 2.2,
    durationMinutes: 4,
  };
  const clear: RouteResult = {
    coordinates: [
      [hazard.longitude + 0.01, hazard.latitude - 0.01],
      [hazard.longitude + 0.01, hazard.latitude + 0.01],
    ],
    distanceKm: 2.6,
    durationMinutes: 6,
  };

  async function fetchRoutes(points: RoutePoint[]) {
    if (points.length === 2) return [direct];
    return points[1].longitude > hazard.longitude ? [clear] : [direct];
  }

  const plan = await planRoute(
    { latitude: hazard.latitude - 0.01, longitude: hazard.longitude, label: "sul" },
    { latitude: hazard.latitude + 0.01, longitude: hazard.longitude, label: "norte" },
    [hazard],
    fetchRoutes,
  );

  assert.equal(plan.hazardsOnRecommended.length, 0);
  assert.equal(plan.recommended, clear);
  assert.equal(plan.direct, direct);
  assert.equal(plan.hazardsOnDirect.length, 1);
});

test("os pontos de desvio cobrem os dois lados da via e mais de uma distância", () => {
  const hazard = INITIAL_OCCURRENCES[0];
  const points = detourPoints(
    [
      [hazard.longitude, hazard.latitude - 0.002],
      [hazard.longitude, hazard.latitude + 0.002],
    ],
    [hazard],
  );
  assert.equal(points.length, 8);
  assert.ok(points.some((point) => point.longitude > hazard.longitude));
  assert.ok(points.some((point) => point.longitude < hazard.longitude));
  const distances = points.map((point) =>
    distanceToRouteKm(point.latitude, point.longitude, [
      [hazard.longitude, hazard.latitude],
    ]),
  );
  assert.ok(Math.min(...distances) > 0.4);
  assert.ok(Math.max(...distances) < 1.3);
});

test("rota real na Jove Soares se afasta do ponto da Prainha", { timeout: 60_000 }, async () => {
  const hazard = INITIAL_OCCURRENCES[0];
  const plan = await planRoute(
    { latitude: -20.095016, longitude: -44.5662212, label: "sul da Jove Soares" },
    { latitude: -20.0668355, longitude: -44.5798667, label: "norte da Jove Soares" },
    [hazard],
  );
  const clearance = distanceToRouteKm(
    hazard.latitude,
    hazard.longitude,
    plan.recommended.coordinates,
  );
  assert.ok(plan.direct, "o caminho direto bloqueado precisa continuar visível");
  assert.equal(plan.hazardsOnRecommended.length, 0);
  assert.ok(clearance > 0.2, `folga de ${clearance.toFixed(3)} km`);
});
