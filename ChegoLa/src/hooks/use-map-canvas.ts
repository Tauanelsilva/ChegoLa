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

const MAP_LOAD_TIMEOUT_MS = 12000;

const OSM_RASTER_PRIMARY: StyleSpecification = {
  version: 8,
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

const CARTO_RASTER_FALLBACK: StyleSpecification = {
  version: 8,
  sources: {
    "carto-light": {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      maxzoom: 20,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap contributors</a> © <a href="https://carto.com/attributions" target="_blank" rel="noreferrer">CARTO</a>',
    },
  },
  layers: [{ id: "carto-light", type: "raster", source: "carto-light" }],
};

function emptyLine() {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: { type: "LineString" as const, coordinates: [] as [number, number][] },
  };
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
  const [provider, setProvider] = useState<"osm" | "carto">("osm");

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
    let fallbackActive = false;
    let fallbackErrorReported = false;

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
      addRouteLine(map, "avoided-route", "#d97706", true);
      addRouteLine(map, "calculated-route", "#0e7490", false);
    };

    const activateFallback = (reason: string) => {
      if (destroyed || fallbackActive) return;
      fallbackActive = true;
      setLoaded(false);
      setProvider("carto");
      onMapNotice?.(
        `${reason} Exibindo temporariamente a base CARTO, que também usa dados do OpenStreetMap.`,
        "warning",
      );
      map.setStyle(CARTO_RASTER_FALLBACK);
    };

    const loadTimeout = window.setTimeout(() => {
      if (!fallbackActive) {
        activateFallback("Os tiles raster do OpenStreetMap demoraram para responder.");
      }
    }, MAP_LOAD_TIMEOUT_MS);

    map.on("style.load", () => {
      if (destroyed) return;
      ensureRouteLayers();
      setLoaded(true);
      window.clearTimeout(loadTimeout);
    });

    map.on("error", (event) => {
      const detail = event.error instanceof Error ? ` (${event.error.message})` : "";
      if (!fallbackActive) {
        activateFallback(`Um tile do OpenStreetMap não pôde ser carregado${detail}.`);
        return;
      }
      if (!fallbackErrorReported) {
        fallbackErrorReported = true;
        onMapNotice?.(
          `O mapa alternativo também encontrou uma falha de rede${detail}. Os pontos e a rota podem ficar incompletos; tente novamente mais tarde.`,
          "error",
        );
      }
    });

    const markers = markersRef.current;
    return () => {
      destroyed = true;
      window.clearTimeout(loadTimeout);
      markers.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [onMapNotice]);

  return { containerRef, mapRef, markersRef, loaded, provider };
}
