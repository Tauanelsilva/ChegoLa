"use client";

import { useEffect, useRef } from "react";
import { LngLatBounds, Marker, Popup, type GeoJSONSource, type Map as MapLibreMap } from "maplibre-gl";
import type { Occurrence } from "@/lib/occurrences";
import { cn } from "@/lib/utils";
import { useMapCanvas, type MapNoticeLevel } from "@/hooks/use-map-canvas";

const RISK_COLORS = {
  "Não classificado": "#092f5f",
  Alto: "#dc2626",
  Médio: "#d97706",
  Baixo: "#0891b2",
} as const;

export type { MapNoticeLevel };

type OccurrenceMapProps = {
  occurrences: Occurrence[];
  routeCoordinates?: [number, number][];
  avoidedCoordinates?: [number, number][];
  onMapNotice?: (message: string, level: MapNoticeLevel) => void;
  focusId?: string | null;
  mapClassName?: string;
};

export function OccurrenceMap({
  occurrences,
  routeCoordinates = [],
  avoidedCoordinates = [],
  onMapNotice,
  focusId = null,
  mapClassName = "h-[560px]",
}: OccurrenceMapProps) {
  const { containerRef, mapRef, markersRef, loaded, provider } = useMapCanvas(onMapNotice);
  const markersByIdRef = useRef<{ id: string; marker: Marker }[]>([]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    markersRef.current.forEach((marker) => marker.remove());
    const nextMarkers = occurrences.map((occurrence) => ({
      id: occurrence.id,
      marker: createMarker(occurrence).addTo(map),
    }));
    markersRef.current = nextMarkers.map((item) => item.marker);
    markersByIdRef.current = nextMarkers;
  }, [loaded, mapRef, markersRef, occurrences]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !focusId) return;
    const occurrence = occurrences.find((item) => item.id === focusId);
    if (!occurrence) return;
    map.flyTo({
      center: [occurrence.longitude, occurrence.latitude],
      zoom: 16,
      duration: 800,
    });
    const popup = markersByIdRef.current.find((item) => item.id === focusId)?.marker.getPopup();
    if (popup && !popup.isOpen()) {
      markersByIdRef.current.find((item) => item.id === focusId)?.marker.togglePopup();
    }
  }, [focusId, loaded, mapRef, occurrences]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;
    setLine(map, "avoided-route", avoidedCoordinates);
    setLine(map, "calculated-route", routeCoordinates);
    const outline = [...avoidedCoordinates, ...routeCoordinates];
    if (outline.length > 1) {
      const bounds = outline.reduce(
        (current, coordinate) => current.extend(coordinate),
        new LngLatBounds(outline[0], outline[0]),
      );
      map.fitBounds(bounds, { padding: 70, maxZoom: 16, duration: 800 });
    }
  }, [avoidedCoordinates, loaded, mapRef, routeCoordinates]);

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border bg-cyan-50 shadow-sm", mapClassName)}>
      <div ref={containerRef} className={cn("w-full", mapClassName)} aria-label="Mapa de Itaúna com pontos de ocorrência" />
      {!loaded && (
        <div className="absolute inset-0 grid place-items-center bg-cyan-50 px-6 text-center text-sm font-semibold text-cyan-900" role="status">
          Carregando mapa OpenStreetMap… Se a rede bloquear os tiles principais, tentaremos uma base alternativa.
        </div>
      )}
      <span className="pointer-events-none absolute left-3 top-3 z-10 rounded-md bg-slate-950/85 px-2 py-1 text-[11px] font-semibold text-white">
        Base: {provider === "osm" ? "OpenStreetMap" : "CARTO/OSM (alternativa)"}
      </span>
      <div className="pointer-events-none absolute bottom-8 left-3 z-10 flex flex-wrap gap-3 rounded-lg bg-white/95 p-2 text-xs font-semibold shadow">
        <span><i className="mr-1 inline-block size-3 rounded-full border-2 border-[#f5a514] bg-[#092f5f]" /> Ponto de fonte oficial</span>
        <span><i className="mr-1 inline-block size-3 rounded-full bg-amber-600" /> Relato colaborativo</span>
      </div>
    </div>
  );
}

function setLine(map: MapLibreMap, sourceId: string, coordinates: [number, number][]) {
  const source = map.getSource(sourceId) as GeoJSONSource | undefined;
  source?.setData({
    type: "Feature",
    properties: {},
    geometry: { type: "LineString", coordinates },
  });
}

function createMarker(occurrence: Occurrence) {
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
  return new Marker({ element }).setLngLat([occurrence.longitude, occurrence.latitude]).setPopup(popup);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ?? character);
}
