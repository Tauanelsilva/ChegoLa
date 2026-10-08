import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { copyFile, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Occurrence } from "@/lib/occurrences";

export class ReportStoreError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ReportStoreError";
    this.status = status;
  }
}

const INDEX_KEY = "chegola:report-index";
const HIDDEN_KEY = "chegola:hidden-occurrences";
const MAX_REPORTS = 200;

type StoreFile = {
  reports: Occurrence[];
  idempotency: Record<string, string>;
  deleteTokens: Record<string, string>;
  hiddenIds: string[];
};

export type SavedReport = {
  occurrence: Occurrence;
  deleteToken?: string;
};

type ReportLock = { tail: Promise<void> };

const globalStore = globalThis as typeof globalThis & {
  __chegolaReportLock?: ReportLock;
};

export type ReportStore = {
  list(): Promise<Occurrence[]>;
  unprotectedIds(): Promise<string[]>;
  save(report: Occurrence, idempotencyKey: string): Promise<SavedReport>;
  remove(id: string, deleteToken: string): Promise<void>;
  hide(id: string): Promise<void>;
  hiddenIds(): Promise<string[]>;
};

export function getReportStore(): ReportStore {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (redisUrl && redisToken) return createRedisStore(redisUrl, redisToken);
  return fileStore;
}

const fileStore: ReportStore = {
  list: () => exclusive(() => readStore().then((store) => published(store.reports))),
  unprotectedIds: () =>
    exclusive(() =>
      readStore().then((store) =>
        store.reports.filter((item) => !store.deleteTokens[item.id]).map((item) => item.id),
      ),
    ),
  save: (report, idempotencyKey) =>
    exclusive(async () => {
      const store = await readStore();
      const existingId = store.idempotency[idempotencyKey];
      if (existingId) {
        return { occurrence: store.reports.find((item) => item.id === existingId) ?? report };
      }
      const deleteToken = randomBytes(24).toString("base64url");
      store.deleteTokens[report.id] = hashToken(deleteToken);
      store.reports = [report, ...store.reports].slice(0, MAX_REPORTS);
      store.idempotency[idempotencyKey] = report.id;
      retainKnownReports(store);
      await writeStore(store);
      return { occurrence: report, deleteToken };
    }),
  remove: (id, deleteToken) =>
    exclusive(async () => {
      const store = await readStore();
      if (!store.reports.some((item) => item.id === id)) return;
      assertCanRemove(store.deleteTokens[id], deleteToken);
      const next = store.reports.filter((item) => item.id !== id);
      store.reports = next;
      delete store.deleteTokens[id];
      for (const [key, value] of Object.entries(store.idempotency)) {
        if (value === id) delete store.idempotency[key];
      }
      await writeStore(store);
    }),
  hide: (id) =>
    exclusive(async () => {
      const store = await readStore();
      if (store.hiddenIds.includes(id)) return;
      store.hiddenIds = [...store.hiddenIds, id];
      await writeStore(store);
    }),
  hiddenIds: () => exclusive(() => readStore().then((store) => store.hiddenIds)),
};

function createRedisStore(url: string, token: string): ReportStore {
  return {
    async list() {
      const ids = await listedIds(url, token);
      if (!ids.length) return [];
      const rows = await redis<(string | null)[]>(url, token, ["MGET", ...ids.map(reportKey)]);
      return published(rows.flatMap(parseReport));
    },
    async unprotectedIds() {
      const ids = await listedIds(url, token);
      if (!ids.length) return [];
      const hashes = await redis<(string | null)[]>(url, token, ["MGET", ...ids.map(deleteTokenKey)]);
      return ids.filter((_, index) => !hashes[index]);
    },
    async save(report, idempotencyKey) {
      const existingId = await redis<string | null>(url, token, ["GET", idempotencyKeyName(idempotencyKey)]);
      if (existingId) {
        const stored = parseReport(await redis<string | null>(url, token, ["GET", reportKey(existingId)]));
        return { occurrence: stored[0] ?? report };
      }
      const saved = await redis<string | null>(url, token, [
        "SET",
        idempotencyKeyName(idempotencyKey),
        report.id,
        "NX",
      ]);
      if (saved !== "OK") {
        const winnerId = await redis<string | null>(url, token, ["GET", idempotencyKeyName(idempotencyKey)]);
        const stored = parseReport(
          winnerId ? await redis<string | null>(url, token, ["GET", reportKey(winnerId)]) : null,
        );
        return { occurrence: stored[0] ?? report };
      }
      const deleteToken = randomBytes(24).toString("base64url");
      await redis(url, token, ["SET", reportKey(report.id), JSON.stringify(report)]);
      await redis(url, token, ["SET", deleteTokenKey(report.id), hashToken(deleteToken)]);
      await redis(url, token, ["ZADD", INDEX_KEY, String(Date.parse(report.createdAt)), report.id]);
      return { occurrence: report, deleteToken };
    },
    async remove(id, deleteToken) {
      const storedHash = await redis<string | null>(url, token, ["GET", deleteTokenKey(id)]);
      const storedReport = parseReport(await redis<string | null>(url, token, ["GET", reportKey(id)]));
      if (!storedReport.length && !storedHash) return;
      assertCanRemove(storedHash ?? undefined, deleteToken);
      await redis(url, token, ["DEL", reportKey(id), deleteTokenKey(id), idempotencyKeyName(id)]);
      await redis(url, token, ["ZREM", INDEX_KEY, id]);
    },
    async hide(id) {
      await redis(url, token, ["SADD", HIDDEN_KEY, id]);
    },
    async hiddenIds() {
      const ids = await redis<string[]>(url, token, ["SMEMBERS", HIDDEN_KEY]);
      return ids ?? [];
    },
  };
}

async function listedIds(url: string, token: string) {
  const ids = await redis<string[]>(url, token, ["ZRANGE", INDEX_KEY, "0", String(MAX_REPORTS - 1), "REV"]);
  return ids ?? [];
}

async function redis<T>(url: string, token: string, command: string[]) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error("Não foi possível acessar o armazenamento compartilhado.");
  }
  const body = (await response.json()) as { result?: T; error?: string };
  if (body.error) throw new Error("Não foi possível acessar o armazenamento compartilhado.");
  return body.result as T;
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function tokenMatches(storedHash: string, token: string) {
  const actual = Buffer.from(hashToken(token), "hex");
  const expected = Buffer.from(storedHash, "hex");
  if (actual.length !== expected.length || expected.length === 0) return false;
  return timingSafeEqual(actual, expected);
}

function assertCanRemove(storedHash: string | undefined, deleteToken: string) {
  if (!storedHash || !deleteToken) return;
  if (!tokenMatches(storedHash, deleteToken)) {
    throw new ReportStoreError("Só quem enviou este relato neste navegador pode apagá-lo.", 403);
  }
}

function retainKnownReports(store: StoreFile) {
  const kept = new Set(store.reports.map((item) => item.id));
  for (const id of Object.keys(store.deleteTokens)) {
    if (!kept.has(id)) delete store.deleteTokens[id];
  }
  for (const [key, id] of Object.entries(store.idempotency)) {
    if (!kept.has(id)) delete store.idempotency[key];
  }
}

function reportKey(id: string) {
  return `chegola:report:${id}`;
}

function deleteTokenKey(id: string) {
  return `chegola:report-delete:${id}`;
}

function idempotencyKeyName(key: string) {
  return `chegola:idem:${key}`;
}

function parseReport(value: string | null) {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return parsed && typeof parsed === "object" ? [parsed as Occurrence] : [];
  } catch {
    return [];
  }
}

function published(reports: Occurrence[]) {
  return [...reports].sort((left, right) => right.createdAt.localeCompare(left.createdAt)).slice(0, MAX_REPORTS);
}

function storePath() {
  return process.env.CHEGOLA_REPORTS_PATH ?? path.join(process.cwd(), "data", "community-reports.json");
}

async function readStore(): Promise<StoreFile> {
  try {
    const parsed: unknown = JSON.parse(await readFile(storePath(), "utf8"));
    if (!parsed || typeof parsed !== "object") return emptyStore();
    const store = parsed as Partial<StoreFile>;
    return {
      reports: Array.isArray(store.reports) ? store.reports : [],
      idempotency: store.idempotency && typeof store.idempotency === "object" ? store.idempotency : {},
      deleteTokens: store.deleteTokens && typeof store.deleteTokens === "object" ? store.deleteTokens : {},
      hiddenIds: Array.isArray(store.hiddenIds)
        ? store.hiddenIds.filter((id) => typeof id === "string")
        : [],
    };
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreFile) {
  const target = storePath();
  const temporary = `${target}.${process.pid}.tmp`;
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(temporary, JSON.stringify(store), "utf8");
  await copyFile(temporary, target);
  await unlink(temporary).catch(() => undefined);
}

function emptyStore(): StoreFile {
  return { reports: [], idempotency: {}, deleteTokens: {}, hiddenIds: [] };
}

function exclusive<T>(task: () => Promise<T>) {
  const lock = globalStore.__chegolaReportLock ?? { tail: Promise.resolve() };
  globalStore.__chegolaReportLock = lock;
  const run = lock.tail.then(task, task);
  lock.tail = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}
