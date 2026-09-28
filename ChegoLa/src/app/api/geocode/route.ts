import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
const ITAUNA_VIEWBOX = "-44.66,-20.15,-44.49,-20.00";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MINIMUM_REQUEST_INTERVAL_MS = 1100;
const MAX_VARIANTS = 5;

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
};

type GeocodeResult = {
  latitude: number;
  longitude: number;
  label: string;
  matchedQuery: string;
  approximate: boolean;
};

type CacheEntry = {
  expiresAt: number;
  result: GeocodeResult | null;
  attemptedQueries: string[];
};

type GeocodeState = {
  cache: Map<string, CacheEntry>;
  queue: Promise<void>;
  nextRequestAt: number;
};

const globalWithGeocode = globalThis as typeof globalThis & {
  __chegolaGeocodeState?: GeocodeState;
};

const state =
  globalWithGeocode.__chegolaGeocodeState ??
  (globalWithGeocode.__chegolaGeocodeState = {
    cache: new Map<string, CacheEntry>(),
    queue: Promise.resolve(),
    nextRequestAt: 0,
  });

const LOCAL_ALIASES = new Map<string, string>([
  ["praca da matriz", "Praça Dr. Augusto Gonçalves"],
  ["praça da matriz", "Praça Dr. Augusto Gonçalves"],
]);

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 3 || query.length > 160) {
    return NextResponse.json(
      { error: "Informe um local entre 3 e 160 caracteres." },
      { status: 400 },
    );
  }

  const cacheKey = normalizeForComparison(query);
  const cached = state.cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return createResultResponse(query, cached);
  }

  const variants = buildQueryVariants(query).slice(0, MAX_VARIANTS);
  const attemptedQueries: string[] = [];

  try {
    for (const variant of variants) {
      attemptedQueries.push(variant.query);
      const results = await queryNominatim(variant.query);
      const valid = results.find(isInsideItauna);
      if (!valid) continue;

      const result: GeocodeResult = {
        latitude: Number(valid.lat),
        longitude: Number(valid.lon),
        label: valid.display_name,
        matchedQuery: variant.query,
        approximate: variant.approximate,
      };
      const entry = {
        expiresAt: Date.now() + CACHE_TTL_MS,
        result,
        attemptedQueries,
      };
      state.cache.set(cacheKey, entry);
      return createResultResponse(query, entry);
    }

    const entry = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      result: null,
      attemptedQueries,
    };
    state.cache.set(cacheKey, entry);
    return createResultResponse(query, entry);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Falha inesperada ao consultar o geocodificador.";
    return NextResponse.json(
      {
        error: message,
        attemptedQueries,
      },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }
}

function createResultResponse(query: string, entry: CacheEntry) {
  const headers = {
    "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
  };
  if (!entry.result) {
    return NextResponse.json(
      {
        error: `Não encontramos “${query}” em Itaúna. Tente o logradouro sem número, um ponto de referência ou coordenadas.`,
        attemptedQueries: entry.attemptedQueries,
      },
      { status: 404, headers },
    );
  }
  return NextResponse.json(
    {
      query,
      result: entry.result,
      attemptedQueries: entry.attemptedQueries,
    },
    { headers },
  );
}

function buildQueryVariants(query: string) {
  const cleaned = query.replace(/\s+/g, " ").trim();
  const variants: Array<{ query: string; approximate: boolean }> = [];
  const add = (value: string, approximate: boolean) => {
    const normalized = value.replace(/\s+/g, " ").replace(/^[,\s]+|[,\s]+$/g, "");
    if (
      normalized.length >= 3 &&
      !variants.some(
        (item) =>
          normalizeForComparison(item.query) ===
          normalizeForComparison(normalized),
      )
    ) {
      variants.push({ query: normalized, approximate });
    }
  };

  add(cleaned, false);

  const alias = LOCAL_ALIASES.get(normalizeForComparison(cleaned));
  if (alias) add(alias, true);

  const withoutNumber = cleaned
    .replace(/,?\s+\d+(?:\s*[-–]\s*\d+)?(?:\s*\/\s*\d+)?\s*$/u, "")
    .trim();
  if (withoutNumber !== cleaned) add(withoutNumber, true);

  const withoutNeighborhoodPrefix = cleaned.replace(
    /^(?:bairro|região|regiao)\s+/iu,
    "",
  );
  if (withoutNeighborhoodPrefix !== cleaned) {
    add(withoutNeighborhoodPrefix, true);
  }

  const streetStart = cleaned.search(
    /\s+(?:rua|avenida|av\.?|praça|praca|travessa|rodovia)\s+/iu,
  );
  if (streetStart > 0) {
    add(cleaned.slice(0, streetStart), true);
    add(cleaned.slice(streetStart).replace(/,\s*\d.*$/u, ""), true);
  }

  return variants;
}

async function queryNominatim(query: string) {
  const task = state.queue.then(async () => {
    const waitMs = Math.max(0, state.nextRequestAt - Date.now());
    if (waitMs) {
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
    state.nextRequestAt = Date.now() + MINIMUM_REQUEST_INTERVAL_MS;

    const params = new URLSearchParams({
      q: `${query}, Itaúna, Minas Gerais, Brasil`,
      format: "jsonv2",
      limit: "3",
      countrycodes: "br",
      viewbox: ITAUNA_VIEWBOX,
      bounded: "1",
      "accept-language": "pt-BR",
      addressdetails: "1",
    });
    const response = await fetch(`${NOMINATIM_ENDPOINT}?${params}`, {
      headers: {
        Accept: "application/json",
        "Accept-Language": "pt-BR",
        "User-Agent":
          "Chegola-MVP/1.0 (demonstracao academica; github.com/TauanelSilva/ChegoLa)",
      },
      cache: "force-cache",
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) {
      throw new Error(
        `O Nominatim respondeu com HTTP ${response.status}. Tente novamente mais tarde.`,
      );
    }
    return (await response.json()) as NominatimResult[];
  });

  state.queue = task.then(
    () => undefined,
    () => undefined,
  );
  return task;
}

function isInsideItauna(result: NominatimResult) {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -20.15 &&
    latitude <= -20.0 &&
    longitude >= -44.66 &&
    longitude <= -44.49
  );
}

function normalizeForComparison(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}
