import { loadLocalOccurrences } from "@/lib/occurrences";

const TOKEN_KEY = "chegola:report-delete-tokens:v1";

let openDeletionIds = new Set<string>();

export function rememberOpenDeletionIds(ids: string[]) {
  openDeletionIds = new Set(ids);
}

export function rememberDeleteToken(id: string, token: string) {
  const tokens = readTokens();
  tokens[id] = token;
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function readDeleteToken(id: string) {
  return readTokens()[id] ?? "";
}

export function forgetDeleteToken(id: string) {
  const tokens = readTokens();
  if (!(id in tokens)) return;
  delete tokens[id];
  window.localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function canWithdrawReport(id: string) {
  if (typeof window === "undefined") return false;
  if (readDeleteToken(id) || openDeletionIds.has(id)) return true;
  return loadLocalOccurrences().occurrences.some((item) => item.id === id);
}

function readTokens() {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(TOKEN_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, string] => typeof entry[1] === "string" && entry[1].length > 0,
      ),
    );
  } catch {
    return {};
  }
}
