import { PRAINHA_ANCHOR, SUPPLEMENTAL_STREETS } from "@/lib/supplemental-streets";

const IGNORED = new Set([
  "a",
  "as",
  "bairro",
  "brasil",
  "da",
  "das",
  "de",
  "do",
  "dos",
  "e",
  "em",
  "gerais",
  "gracas",
  "itauna",
  "mg",
  "minas",
  "prainha",
]);

export type LocalStreetMatch = {
  latitude: number;
  longitude: number;
  label: string;
  name: string;
};

export function normalizePlaceText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

export function dropUnmappedNeighborhood(value: string) {
  return value
    .replace(/\bprainha\b/giu, " ")
    .replace(/\s+/g, " ")
    .replace(/\s+,/g, ",")
    .replace(/^[,\s]+|[,\s]+$/g, "")
    .trim();
}

function significantTokens(value: string) {
  return normalizePlaceText(value)
    .split(" ")
    .filter((token) => token.length > 1 && !IGNORED.has(token) && !/^\d+$/.test(token));
}

function lineMidpoint(line: [number, number][]) {
  return line[Math.floor(line.length / 2)];
}

export function findSupplementalStreet(query: string): LocalStreetMatch | null {
  const tokens = significantTokens(query);
  if (tokens.length === 0 && /\bprainha\b/iu.test(query)) {
    return {
      latitude: PRAINHA_ANCHOR.latitude,
      longitude: PRAINHA_ANCHOR.longitude,
      label: PRAINHA_ANCHOR.label,
      name: "Prainha",
    };
  }

  let best: { street: (typeof SUPPLEMENTAL_STREETS)[number]; score: number } | null = null;
  for (const street of SUPPLEMENTAL_STREETS) {
    for (const name of [street.name, ...street.aliases]) {
      const streetTokens = significantTokens(name);
      if (!streetTokens.length || !streetTokens.every((token) => tokens.includes(token))) {
        continue;
      }
      const extra = tokens.filter((token) => !streetTokens.includes(token));
      if (extra.length > 0) continue;
      const score = streetTokens.length;
      if (!best || score > best.score) best = { street, score };
    }
  }
  if (!best) return null;

  const longest = [...best.street.lines].sort((left, right) => right.length - left.length)[0];
  const [longitude, latitude] = lineMidpoint(longest);
  return {
    latitude,
    longitude,
    name: best.street.name,
    label: `${best.street.name}, Itaúna. Eixo aproximado da base IBGE; o nome desta via não está no OpenStreetMap.`,
  };
}
