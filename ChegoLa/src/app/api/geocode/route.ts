import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NOMINATIM_ENDPOINT = "https://nominatim.openstreetmap.org/search";
// Limites da relação administrativa de Itaúna no OpenStreetMap (relation 315272).
const ITAUNA_VIEWBOX = "-44.718046,-19.936,-44.445,-20.224406";
const ITAUNA_BOUNDS = {
  south: -20.224406,
  north: -19.936,
  west: -44.718046,
  east: -44.445,
};
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MINIMUM_REQUEST_INTERVAL_MS = 1100;
const MAX_VARIANTS = 6;

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  addresstype?: string;
  importance?: number;
  address?: Record<string, string>;
};

type GeocodeResult = {
  latitude: number;
  longitude: number;
  label: string;
  matchedQuery: string;
  approximate: boolean;
  matchType: "exact" | "approximate";
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

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (query.length < 3 || query.length > 160) {
    return NextResponse.json(
      { error: "Informe um local entre 3 e 160 caracteres." },
      { status: 400 },
    );
  }

  const cacheKey = `v2:${normalizeForComparison(query)}`;
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
      const valid = chooseBestResult(results, variant.query);
      if (!valid) continue;
      const exact = isExactTextualMatch(query, valid) && !variant.approximate;

      const result: GeocodeResult = {
        latitude: Number(valid.lat),
        longitude: Number(valid.lon),
        label: valid.display_name,
        matchedQuery: variant.query,
        approximate: !exact,
        matchType: exact ? "exact" : "approximate",
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
  const cleaned = stripItaunaSuffix(query.replace(/\s+/g, " ").trim());
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

  const withoutNumber = cleaned
    .replace(
      /(?:,|\s)\s*(?:n[ºo.]?\s*)?\d+(?:\s*[-–]\s*\d+)?(?:\s*\/\s*\d+)?(?:\s*,.*)?$/iu,
      "",
    )
    .trim();
  if (withoutNumber !== cleaned) add(withoutNumber, true);

  const withoutNeighborhoodPrefix = cleaned.replace(
    /^(?:bairro|região|regiao)\s+/iu,
    "",
  );
  if (withoutNeighborhoodPrefix !== cleaned) {
    add(withoutNeighborhoodPrefix, true);
  }

  const withoutComplement = cleaned.replace(
    /\s*(?:\([^)]*\)|,\s*(?:ap(?:to)?|apartamento|bloco|sala|fundos|pr[oó]ximo).*)$/iu,
    "",
  );
  if (withoutComplement !== cleaned) add(withoutComplement, true);

  const streetStart = cleaned.search(
    /\b(?:rua|avenida|av\.?|praça|praca|travessa|alameda|rodovia|estrada|beco)\b/iu,
  );
  if (streetStart > 0) {
    add(cleaned.slice(0, streetStart), true);
    add(
      cleaned
        .slice(streetStart)
        .replace(/(?:,|\s)\s*(?:n[ºo.]?\s*)?\d.*$/iu, ""),
      true,
    );
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
      limit: "5",
      countrycodes: "br",
      viewbox: ITAUNA_VIEWBOX,
      bounded: "1",
      "accept-language": "pt-BR",
      addressdetails: "1",
      dedupe: "1",
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

function chooseBestResult(results: NominatimResult[], query: string) {
  return results
    .filter(isInsideItauna)
    .map((result) => ({
      result,
      score:
        tokenCoverage(query, result.display_name) * 10 +
        (result.importance ?? 0),
    }))
    .sort((a, b) => b.score - a.score)[0]?.result;
}

function isInsideItauna(result: NominatimResult) {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);
  const jurisdiction = [
    result.address?.city,
    result.address?.town,
    result.address?.municipality,
    result.address?.city_district,
    result.display_name,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= ITAUNA_BOUNDS.south &&
    latitude <= ITAUNA_BOUNDS.north &&
    longitude >= ITAUNA_BOUNDS.west &&
    longitude <= ITAUNA_BOUNDS.east &&
    normalizeForComparison(jurisdiction).includes("itauna")
  );
}

function isExactTextualMatch(query: string, result: NominatimResult) {
  const coverage = tokenCoverage(stripItaunaSuffix(query), result.display_name);
  const requestedNumbers = normalizeForComparison(query).match(/\b\d+\b/g) ?? [];
  const resultText = normalizeForComparison(result.display_name);
  const numbersMatch = requestedNumbers.every((number) =>
    resultText.split(" ").includes(number),
  );
  return coverage === 1 && numbersMatch;
}

function tokenCoverage(query: string, resultLabel: string) {
  const ignored = new Set([
    "a",
    "as",
    "da",
    "das",
    "de",
    "do",
    "dos",
    "e",
    "em",
    "itauna",
    "mg",
    "minas",
    "gerais",
    "brasil",
  ]);
  const tokens = normalizeForComparison(query)
    .split(" ")
    .filter((token) => token.length > 1 && !ignored.has(token));
  if (!tokens.length) return 0;
  const resultTokens = new Set(normalizeForComparison(resultLabel).split(" "));
  return (
    tokens.filter((token) => resultTokens.has(token)).length / tokens.length
  );
}

function stripItaunaSuffix(value: string) {
  return value
    .replace(
      /(?:,\s*)?ita[uú]na(?:\s*[-,/]\s*(?:mg|minas gerais))?(?:\s*,\s*brasil)?\s*$/iu,
      "",
    )
    .replace(/[,\s]+$/u, "")
    .trim();
}

function normalizeForComparison(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("pt-BR")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}
