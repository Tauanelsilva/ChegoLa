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
} from "maplibre-gl";
import type { Occurrence } from "@/lib/occurrences";

const RISK_COLORS = {
  Alto: "#dc2626",
  Médio: "#d97706",
  Baixo: "#0891b2",
} as const;

type OccurrenceMapProps = {
  occurrences: Occurrence[];
  routeCoordinates?: [number, number][];
  onMapError?: (message: string) => void;
};

export function OccurrenceMap({
  occurrences,
  routeCoordinates = [],
  onMapError,
}: OccurrenceMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    setWorkerUrl("/maplibre-gl-worker.mjs");
    const map = new Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: [-44.5764, -20.0756],
      zoom: 13,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(
      new AttributionControl({
        customAttribution:
          'Mapa: <a href="https://openfreemap.org/" target="_blank" rel="noreferrer">OpenFreeMap</a> · Dados © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>',
        compact: true,
      }),
    );
    map.addControl(new NavigationControl(), "top-right");
    map.addControl(
      new GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right",
    );

    map.on("load", () => {
      map.addSource("calculated-route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: { type: "LineString", coordinates: [] },
        },
      });
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
      setLoaded(true);
    });

    map.on("error", () => {
      if (!map.isStyleLoaded()) {
        onMapError?.(
          "O mapa-base público não pôde ser carregado. Confira sua conexão e tente novamente.",
        );
      }
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [onMapError]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = occurrences.map((occurrence) => {
      const element = document.createElement("button");
      element.type = "button";
      element.className =
        "size-6 rounded-full border-2 border-white shadow-lg focus:outline-none focus:ring-4 focus:ring-cyan-300";
      element.style.backgroundColor = RISK_COLORS[occurrence.risk];
      element.setAttribute(
        "aria-label",
        `${occurrence.place}, risco ${occurrence.risk}`,
      );

      const popup = new Popup({ offset: 16 }).setHTML(
        `<div style="max-width:220px"><strong>${escapeHtml(occurrence.place)}</strong><br/><span>${escapeHtml(occurrence.region)} · Risco ${occurrence.risk}</span><br/><small>${occurrence.source}</small></div>`,
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
        new LngLatBounds(
          routeCoordinates[0],
          routeCoordinates[0],
        ),
      );
      map.fitBounds(bounds, { padding: 70, maxZoom: 16, duration: 800 });
    }
  }, [loaded, routeCoordinates]);

  return (
    <div className="relative min-h-[560px] overflow-hidden rounded-2xl border bg-cyan-50 shadow-sm">
      <div
        ref={containerRef}
        className="absolute inset-0"
        aria-label="Mapa de Itaúna com pontos de ocorrência"
      />
      {!loaded && (
        <div
          className="absolute inset-0 grid place-items-center bg-cyan-50 text-sm font-semibold text-cyan-900"
          role="status"
        >
          Carregando mapa público…
        </div>
      )}
      <div className="pointer-events-none absolute bottom-8 left-3 z-10 flex flex-wrap gap-2 rounded-lg bg-white/95 p-2 text-xs font-semibold shadow">
        <span><i className="mr-1 inline-block size-2 rounded-full bg-red-600" /> Alto</span>
        <span><i className="mr-1 inline-block size-2 rounded-full bg-amber-600" /> Médio</span>
        <span><i className="mr-1 inline-block size-2 rounded-full bg-cyan-600" /> Baixo</span>
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

