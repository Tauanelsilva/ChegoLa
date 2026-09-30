export type RiskLevel = "Não classificado" | "Baixo" | "Médio" | "Alto";
export type OccurrenceSource = "Fonte oficial" | "Relato local";
export type LocationPrecision = "Trecho aproximado" | "Coordenada informada";

export type Occurrence = {
  id: string;
  place: string;
  region: string;
  risk: RiskLevel;
  description: string;
  date: string;
  time: string;
  latitude: number;
  longitude: number;
  source: OccurrenceSource;
  createdAt: string;
  sourceUrl?: string;
  sourceTitle?: string;
  publishedAt?: string;
  consultedAt?: string;
  locationPrecision?: LocationPrecision;
};

export const STORAGE_KEY = "chegola:occurrences:v1";
export const OCCURRENCES_CHANGED_EVENT = "chegola:occurrences-changed";

export const INITIAL_OCCURRENCES: Occurrence[] = [
  {
    id: "oficial-jove-soares-prainha",
    place: "Avenida Jove Soares (Prainha)",
    region: "Centro",
    risk: "Não classificado",
    description:
      "A Prefeitura registrou alagamentos históricos ao longo da via e insuficiência de vazão do canal. Este marcador representa um trecho geocodificado da avenida, não uma ocorrência atual nem toda a área afetada.",
    date: "2017-07-07",
    time: "12:00",
    latitude: -20.0770707,
    longitude: -44.5799632,
    source: "Fonte oficial",
    createdAt: "2017-07-07T15:00:00.000Z",
    sourceUrl:
      "https://www.itauna.mg.gov.br/portal/noticias/0/3/1530/equipe-do-governo-de-itauna-faz-vistoria-no-canal-da-jove-soares",
    sourceTitle:
      "Equipe do Governo de Itaúna faz vistoria no canal da Jove Soares",
    publishedAt: "2017-07-07",
    consultedAt: "2026-09-29",
    locationPrecision: "Trecho aproximado",
  },
];

function isOccurrence(value: unknown): value is Occurrence {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Occurrence>;
  return (
    typeof item.id === "string" &&
    typeof item.place === "string" &&
    typeof item.region === "string" &&
    ["Baixo", "Médio", "Alto"].includes(item.risk ?? "") &&
    typeof item.description === "string" &&
    typeof item.date === "string" &&
    typeof item.time === "string" &&
    typeof item.latitude === "number" &&
    Number.isFinite(item.latitude) &&
    typeof item.longitude === "number" &&
    Number.isFinite(item.longitude) &&
    item.source === "Relato local" &&
    typeof item.createdAt === "string"
  );
}

export function loadLocalOccurrences(): {
  occurrences: Occurrence[];
  error?: string;
} {
  if (typeof window === "undefined") return { occurrences: [] };

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { occurrences: [] };
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Formato inválido");
    return { occurrences: parsed.filter(isOccurrence) };
  } catch {
    return {
      occurrences: [],
      error:
        "Não foi possível ler os relatos salvos neste navegador. O armazenamento local pode estar bloqueado ou corrompido.",
    };
  }
}

export function loadAllOccurrences() {
  const local = loadLocalOccurrences();
  return {
    occurrences: [...local.occurrences, ...INITIAL_OCCURRENCES],
    error: local.error,
  };
}

export function saveLocalOccurrence(occurrence: Occurrence) {
  const current = loadLocalOccurrences();
  if (current.error) throw new Error(current.error);
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([occurrence, ...current.occurrences]),
  );
  window.dispatchEvent(new Event(OCCURRENCES_CHANGED_EVENT));
}

