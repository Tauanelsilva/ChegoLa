export type RiskLevel = "Baixo" | "Médio" | "Alto";
export type OccurrenceSource = "Demonstração" | "Relato local";

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
};

export const STORAGE_KEY = "chegola:occurrences:v1";
export const OCCURRENCES_CHANGED_EVENT = "chegola:occurrences-changed";

export const INITIAL_OCCURRENCES: Occurrence[] = [
  {
    id: "demo-jove-soares",
    place: "Av. Jove Soares",
    region: "Centro",
    risk: "Alto",
    description: "Ponto demonstrativo próximo à região central. Informação não oficial.",
    date: "2026-09-27",
    time: "17:42",
    latitude: -20.0749,
    longitude: -44.5762,
    source: "Demonstração",
    createdAt: "2026-09-27T20:42:00.000Z",
  },
  {
    id: "demo-silva-jardim",
    place: "Rua Silva Jardim",
    region: "Garcias",
    risk: "Médio",
    description: "Ponto fictício usado para demonstrar alertas próximos à rota.",
    date: "2026-09-27",
    time: "17:18",
    latitude: -20.068,
    longitude: -44.5686,
    source: "Demonstração",
    createdAt: "2026-09-27T20:18:00.000Z",
  },
  {
    id: "demo-miguel-augusto",
    place: "Av. Dr. Miguel Augusto Gonçalves",
    region: "Santanense",
    risk: "Baixo",
    description: "Localização aproximada e simulada para a experiência do mapa.",
    date: "2026-09-27",
    time: "16:55",
    latitude: -20.0904,
    longitude: -44.5893,
    source: "Demonstração",
    createdAt: "2026-09-27T19:55:00.000Z",
  },
  {
    id: "demo-antonio-corradi",
    place: "Rua Antônio Corradi",
    region: "Nogueira Machado",
    risk: "Médio",
    description: "Relato fictício sem validação por órgão oficial.",
    date: "2026-09-27",
    time: "15:37",
    latitude: -20.0815,
    longitude: -44.5608,
    source: "Demonstração",
    createdAt: "2026-09-27T18:37:00.000Z",
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

