"use client";

import { useEffect, useRef, useState } from "react";
import {
  AttributionControl,
  GeolocateControl,
  LngLatBounds,
  Map,
  Marker,
  NavigationControl,
  Popup,
  setWorkerUrl,
  type GeoJSONSource,
  type StyleSpecification,
} from "maplibre-gl";
import type { Occurrence } from "@/lib/occurrences";

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
  layers: [
    {
      id: "osm-standard",
      type: "raster",
      source: "osm-standard",
    },
  ],
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
  layers: [
    {
      id: "carto-light",
      type: "raster",
      source: "carto-light",
    },
  ],
};

const RISK_COLORS = {
  "Não classificado": "#092f5f",
  Alto: "#dc2626",
  Médio: "#d97706",
  Baixo: "#0891b2",
} as const;

export type MapNoticeLevel = "warning" | "error";

type OccurrenceMapProps = {
  occurrences: Occurrence[];
  routeCoordinates?: [number, number][];
  onMapNotice?: (message: string, level: MapNoticeLevel) => void;
};

export function OccurrenceMap({
  occurrences,
  routeCoordinates = [],
  onMapNotice,
}: OccurrenceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [provider, setProvider] = useState<"osm" | "carto">("osm");

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Os dois módulos são sincronizados de node_modules para public/ pelos
    // scripts predev, prebuild e postinstall. Isso evita workers blob frágeis
    // no Turbopack, Windows e Vercel.
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
      if (!map.getSource("calculated-route")) {
        map.addSource("calculated-route", {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: { type: "LineString", coordinates: [] },
          },
        });
      }
      if (!map.getLayer("calculated-route-outline")) {
        map.addLayer({
          id: "calculated-route-outline",
          type: "line",
          source: "calculated-route",
          paint: {
            "line-color": "#ffffff",
            "line-width": 8,
            "line-opacity": 0.9,
          },
        });
      }
      if (!map.getLayer("calculated-route-line")) {
        map.addLayer({
          id: "calculated-route-line",
          type: "line",
          source: "calculated-route",
          paint: {
            "line-color": "#0e7490",
            "line-width": 5,
            "line-opacity": 0.95,
          },
        });
      }
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
        activateFallback(
          "Os tiles raster do OpenStreetMap demoraram para responder.",
        );
      }
    }, MAP_LOAD_TIMEOUT_MS);

    map.on("style.load", () => {
      if (destroyed) return;
      ensureRouteLayers();
      setLoaded(true);
      window.clearTimeout(loadTimeout);
    });

    map.on("error", (event) => {
      const detail =
        event.error instanceof Error ? ` (${event.error.message})` : "";
      if (!fallbackActive) {
        activateFallback(
          `Um tile do OpenStreetMap não pôde ser carregado${detail}.`,
        );
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

    return () => {
      destroyed = true;
      window.clearTimeout(loadTimeout);
      markersRef.current.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [onMapNotice]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = occurrences.map((occurrence) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className = occurrence.source === "Fonte oficial"
        ? "grid size-8 place-items-center rounded-full border-2 border-white bg-[#092f5f] shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300"
        : "size-6 rounded-full border-2 border-white shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300";
      element.style.backgroundColor = RISK_COLORS[occurrence.risk];
      if (occurrence.source === "Fonte oficial") {
        const center = document.createElement("span");
        center.className = "block size-3 rounded-full bg-[#f5a514]";
        element.appendChild(center);
      }
      element.setAttribute(
        "aria-label",
        `${occurrence.place}, ${occurrence.source.toLocaleLowerCase("pt-BR")}${occurrence.risk === "Não classificado" ? ", sem classificação de risco" : `, risco ${occurrence.risk}`}`,
      );

      const sourceLink = occurrence.sourceUrl
        ? `<br/><a href="${escapeHtml(occurrence.sourceUrl)}" target="_blank" rel="noreferrer" style="color:#0e7490;text-decoration:underline">Abrir fonte oficial</a>`
        : "";
      const popup = new Popup({ offset: 16 }).setHTML(
        `<div style="max-width:240px"><strong>${escapeHtml(occurrence.place)}</strong><br/><span>${escapeHtml(occurrence.region)}${occurrence.risk === "Não classificado" ? " · Risco não classificado" : ` · Risco ${occurrence.risk}`}</span><br/><small>${occurrence.source}${occurrence.locationPrecision ? ` · ${occurrence.locationPrecision}` : ""}</small>${sourceLink}</div>`,
      );
      return new Marker({ element })
        .setLngLat([occurrence.longitude, occurrence.latitude])
        .setPopup(popup)
        .addTo(map);
    });
  }, [loaded, occurrences]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    const source = map.getSource("calculated-route") as
      | GeoJSONSource
      | undefined;
    source?.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: routeCoordinates },
    });

    if (routeCoordinates.length > 1) {
      const bounds = routeCoordinates.reduce(
        (current, coordinate) => current.extend(coordinate),
        new LngLatBounds(routeCoordinates[0], routeCoordinates[0]),
      );
      map.fitBounds(bounds, { padding: 70, maxZoom: 16, duration: 800 });
    }
  }, [loaded, routeCoordinates]);

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-2xl border bg-cyan-50 shadow-sm">
      <div
        ref={containerRef}
        className="h-[560px] w-full"
        aria-label="Mapa de Itaúna com pontos de ocorrência"
      />
      {!loaded && (
        <div
          className="absolute inset-0 grid place-items-center bg-cyan-50 px-6 text-center text-sm font-semibold text-cyan-900"
          role="status"
        >
          Carregando mapa OpenStreetMap… Se a rede bloquear os tiles principais,
          tentaremos uma base alternativa.
        </div>
      )}
      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-slate-950/85 px-2 py-1 text-[11px] font-semibold text-white">
        Base: {provider === "osm" ? "OpenStreetMap" : "CARTO/OSM (alternativa)"}
      </span>
      <div className="pointer-events-none absolute bottom-8 left-3 z-10 flex flex-wrap gap-3 rounded-lg bg-white/95 p-2 text-xs font-semibold shadow">
        <span>
          <i className="mr-1 inline-block size-3 rounded-full border-2 border-[#f5a514] bg-[#092f5f]" />{" "}
          Ponto de fonte oficial
        </span>
        <span>
          <i className="mr-1 inline-block size-3 rounded-full bg-amber-600" />{" "}
          Relato colaborativo
        </span>
      </div>
    </div>
  );
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[character] ?? character,
  );
}
