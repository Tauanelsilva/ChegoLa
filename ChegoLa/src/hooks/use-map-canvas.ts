"use client";

import { useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  GeolocateControl,
  Map,
  Marker,
  NavigationControl,
  setWorkerUrl,
  type StyleSpecification,
} from "maplibre-gl";

import { SUPPLEMENTAL_STREETS } from "@/lib/supplemental-streets";

const STREET_GLYPHS = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";

const OSM_RASTER_PRIMARY: StyleSpecification = {
  version: 8,
  glyphs: STREET_GLYPHS,
  sources: {
    "osm-standard": {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      maxzoom: 19,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a>',
    },
  },
  layers: [{ id: "osm-standard", type: "raster", source: "osm-standard" }],
};

function emptyLine() {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: [] as [number, number][] },
  };
}

function lineMidpoint(coordinates: [number, number][]) {
  const middle = Math.floor((coordinates.length - 1) / 2);
  const start = coordinates[middle];
  const end = coordinates[Math.min(middle + 1, coordinates.length - 1)];
  return [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2] as [number, number];
}

function missingStreetCollection() {
  return {
    type: "FeatureCollection" as const,
    features: SUPPLEMENTAL_STREETS.flatMap((street) =>
      street.lines.map((coordinates) => ({
        type: "Feature" as const,
        properties: { name: street.name },
        geometry: { type: "LineString" as const, coordinates },
      })),
    ),
  };
}

function missingStreetLabelCollection() {
  return {
    type: "FeatureCollection" as const,
    features: SUPPLEMENTAL_STREETS.flatMap((street) =>
      street.lines.map((coordinates) => ({
        type: "Feature" as const,
        properties: { name: street.name },
        geometry: { type: "Point" as const, coordinates: lineMidpoint(coordinates) },
      })),
    ),
  };
}

function addMissingStreetNames(map: Map) {
  if (map.getSource("missing-streets")) return;
  map.addSource("missing-streets", {
    type: "geojson",
    data: missingStreetCollection(),
  });
  map.addLayer({
    id: "missing-streets-casing",
    type: "line",
    source: "missing-streets",
    minzoom: 14,
    paint: { "line-color": "#ffffff", "line-width": 4.5, "line-opacity": 0.9 },
  });
  map.addLayer({
    id: "missing-streets-line",
    type: "line",
    source: "missing-streets",
    minzoom: 14,
    paint: { "line-color": "#334155", "line-width": 2, "line-opacity": 0.9 },
  });
  map.addSource("missing-street-labels", {
    type: "geojson",
    data: missingStreetLabelCollection(),
  });
  map.addLayer({
    id: "missing-streets-label",
    type: "symbol",
    source: "missing-street-labels",
    minzoom: 15,
    layout: {
      "text-field": ["get", "name"],
      "text-font": ["Open Sans Regular"],
      "text-size": 12,
      "text-max-width": 12,
      "text-anchor": "center",
      "text-padding": 6,
    },
    paint: {
      "text-color": "#1e293b",
      "text-halo-color": "#ffffff",
      "text-halo-width": 1.6,
    },
  });
}

function addRouteLine(map: Map, id: string, color: string, dashed: boolean) {
  if (map.getSource(id)) return;
  map.addSource(id, { type: "geojson", data: emptyLine() });
  map.addLayer({
    id: `${id}-casing`,
    type: "line",
    source: id,
    paint: {
      "line-color": "#ffffff",
      "line-width": dashed ? 7 : 8,
      "line-opacity": 0.9,
    },
  });
  map.addLayer({
    id: `${id}-line`,
    type: "line",
    source: id,
    paint: {
      "line-color": color,
      "line-width": dashed ? 4 : 5,
      "line-opacity": 0.95,
      ...(dashed ? { "line-dasharray": [1.4, 1.1] } : {}),
    },
  });
}

export type MapNoticeLevel = "warning" | "error";

type MapNotice = (message: string, level: MapNoticeLevel) => void;

export function useMapCanvas(onMapNotice?: MapNotice) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    setWorkerUrl("/maplibre-gl-worker.mjs");

    const map = new Map({
      container: containerRef.current,
      style: OSM_RASTER_PRIMARY,
      center: [-44.5764, -20.0756],
      zoom: 13,
      attributionControl: false,
    });
    mapRef.current = map;

    let destroyed = false;
    let tileErrorReported = false;

    map.addControl(new AttributionControl({ compact: true }));
    map.addControl(new NavigationControl(), "top-right");
    map.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right",
    );

    const ensureRouteLayers = () => {
      addMissingStreetNames(map);
      addRouteLine(map, "avoided-route", "#d97706", true);
      addRouteLine(map, "calculated-route", "#0e7490", false);
    };

    const markReady = () => {
      if (destroyed) return;
      try {
        ensureRouteLayers();
      } catch {
        // As ruas extras podem esperar o estilo; os pontos não.
      }
      setLoaded(true);
    };

    map.on("style.load", markReady);
    map.on("load", markReady);
    if (map.isStyleLoaded()) markReady();
    const readyFallback = window.setTimeout(markReady, 1500);

    map.on("error", (event) => {
      const detail = event.error instanceof Error ? event.error.message : "";
      const sourceId = "sourceId" in event ? String(event.sourceId ?? "") : "";
      if (
        sourceId === "missing-streets" ||
        sourceId === "missing-street-labels" ||
        /glyph|font|sprite/i.test(detail)
      ) return;
      if (tileErrorReported) return;
      tileErrorReported = true;
      const suffix = detail ? ` (${detail})` : "";
      onMapNotice?.(
        `Um tile do OpenStreetMap não pôde ser carregado${suffix}. O mapa segue na base principal.`,
        "warning",
      );
    });

    const markers = markersRef.current;
    return () => {
      destroyed = true;
      window.clearTimeout(readyFallback);
      markers.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [onMapNotice]);

  return { containerRef, mapRef, markersRef, loaded };
}
