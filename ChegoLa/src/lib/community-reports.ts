import {
  INITIAL_OCCURRENCES,
  loadLocalOccurrences,
  saveLocalOccurrence,
  STORAGE_KEY,
  type Occurrence,
} from "@/lib/occurrences";

export async function fetchSharedOccurrences() {
  const response = await fetch("/api/occurrences", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar os relatos compartilhados.");
  }
  const body: unknown = await response.json();
  const reports = body && typeof body === "object" && "occurrences" in body
    ? (body as { occurrences: unknown }).occurrences
    : [];
  const community = Array.isArray(reports) ? reports.filter(isSharedOccurrence) : [];
  const pending = loadLocalOccurrences().occurrences.filter(
    (item) => !community.some((shared) => shared.id === item.id),
  );
  return [...pending, ...community, ...INITIAL_OCCURRENCES];
}

export async function publishCommunityReport(occurrence: Occurrence) {
  const response = await fetch("/api/occurrences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": occurrence.id,
    },
    body: JSON.stringify(occurrence),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "Não foi possível salvar a ocorrência.";
    throw new Error(message);
  }
}

export async function submitCommunityReport(occurrence: Occurrence) {
  try {
    await publishCommunityReport(occurrence);
  } catch (caught) {
    saveLocalOccurrence(occurrence);
    const message = caught instanceof Error ? caught.message : "Não foi possível compartilhar a ocorrência.";
    throw new Error(`${message} O relato ficou só neste navegador.`);
  }
}

export async function migrateLocalReports() {
  const local = loadLocalOccurrences();
  if (local.error || local.occurrences.length === 0) return;
  for (const occurrence of local.occurrences) {
    await publishCommunityReport(occurrence);
  }
  window.localStorage.removeItem(STORAGE_KEY);
}

function isSharedOccurrence(value: unknown): value is Occurrence {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<Occurrence>;
  return (
    typeof item.id === "string" &&
    typeof item.place === "string" &&
    typeof item.region === "string" &&
    (item.risk === "Baixo" || item.risk === "Médio" || item.risk === "Alto") &&
    typeof item.description === "string" &&
    typeof item.date === "string" &&
    typeof item.time === "string" &&
    typeof item.latitude === "number" &&
    typeof item.longitude === "number" &&
    item.source === "Relato local" &&
    typeof item.createdAt === "string"
  );
}
