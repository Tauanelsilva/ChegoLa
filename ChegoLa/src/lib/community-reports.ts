import {
  INITIAL_OCCURRENCES,
  loadLocalOccurrences,
  removeLocalOccurrence,
  saveLocalOccurrence,
  STORAGE_KEY,
  type Occurrence,
} from "@/lib/occurrences";
import {
  forgetDeleteToken,
  readDeleteToken,
  rememberDeleteToken,
  rememberOpenDeletionIds,
} from "@/lib/report-keys";

export async function fetchSharedOccurrences() {
  const response = await fetch("/api/occurrences", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Não foi possível carregar os relatos compartilhados.");
  }
  const body: unknown = await response.json();
  const reports = body && typeof body === "object" && "occurrences" in body
    ? (body as { occurrences: unknown }).occurrences
    : [];
  const openDeletionIds = body && typeof body === "object" && "openDeletionIds" in body
    ? (body as { openDeletionIds: unknown }).openDeletionIds
    : [];
  rememberOpenDeletionIds(Array.isArray(openDeletionIds) ? openDeletionIds.filter((id) => typeof id === "string") : []);
  const hiddenIds = new Set(
    body && typeof body === "object" && "hiddenIds" in body && Array.isArray((body as { hiddenIds: unknown }).hiddenIds)
      ? (body as { hiddenIds: unknown[] }).hiddenIds.filter((id) => typeof id === "string")
      : [],
  );
  const community = Array.isArray(reports) ? reports.filter(isSharedOccurrence) : [];
  const pending = loadLocalOccurrences().occurrences.filter(
    (item) => !community.some((shared) => shared.id === item.id),
  );
  return [...pending, ...community, ...INITIAL_OCCURRENCES].filter((item) => !hiddenIds.has(item.id));
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
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "Não foi possível salvar a ocorrência.";
    throw new Error(message);
  }
  const deleteToken = body && typeof body === "object" && "deleteToken" in body
    ? (body as { deleteToken?: unknown }).deleteToken
    : "";
  if (typeof deleteToken === "string" && deleteToken) {
    rememberDeleteToken(occurrence.id, deleteToken);
  }
}

export async function withdrawCommunityReport(id: string) {
  const token = readDeleteToken(id);
  let response: Response;
  try {
    response = await fetch(`/api/occurrences/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: token ? { "X-Delete-Token": token } : {},
    });
  } catch {
    if (!token) {
      removeLocalOccurrence(id);
      return;
    }
    throw new Error("Não foi possível apagar o relato agora.");
  }

  if (response.status === 403) {
    const body: unknown = await response.json().catch(() => null);
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "Só quem enviou este relato neste navegador pode apagá-lo.";
    throw new Error(message);
  }
  if (!response.ok && response.status !== 404) {
    const body: unknown = await response.json().catch(() => null);
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error
      : "Não foi possível apagar o relato agora.";
    throw new Error(message);
  }

  forgetDeleteToken(id);
  removeLocalOccurrence(id);
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
