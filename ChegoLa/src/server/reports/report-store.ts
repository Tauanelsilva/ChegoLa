import { copyFile, mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Occurrence } from "@/lib/occurrences";

const INDEX_KEY = "chegola:report-index";
const MAX_REPORTS = 200;

type StoreFile = {
  reports: Occurrence[];
  idempotency: Record<string, string>;
};

type ReportLock = { tail: Promise<void> };

const globalStore = globalThis as typeof globalThis & {
  __chegolaReportLock?: ReportLock;
};

export type ReportStore = {
  list(): Promise<Occurrence[]>;
  save(report: Occurrence, idempotencyKey: string): Promise<Occurrence>;
};

export function getReportStore(): ReportStore {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (redisUrl && redisToken) return createRedisStore(redisUrl, redisToken);
  return fileStore;
}

const fileStore: ReportStore = {
  list: () => exclusive(() => readStore().then((store) => published(store.reports))),
  save: (report, idempotencyKey) =>
    exclusive(async () => {
      const store = await readStore();
      const existingId = store.idempotency[idempotencyKey];
      if (existingId) {
        return store.reports.find((item) => item.id === existingId) ?? report;
      }
      store.reports = [report, ...store.reports].slice(0, MAX_REPORTS);
      store.idempotency[idempotencyKey] = report.id;
      await writeStore(store);
      return report;
    }),
};

function createRedisStore(url: string, token: string): ReportStore {
  return {
    async list() {
      const ids = await redis<string[]>(url, token, ["ZRANGE", INDEX_KEY, "0", String(MAX_REPORTS - 1), "REV"]);
      if (!ids?.length) return [];
      const rows = await redis<(string | null)[]>(url, token, ["MGET", ...ids.map(reportKey)]);
      return published(rows.flatMap(parseReport));
    },
    async save(report, idempotencyKey) {
      const existingId = await redis<string | null>(url, token, ["GET", idempotencyKeyName(idempotencyKey)]);
      if (existingId) {
        const stored = parseReport(await redis<string | null>(url, token, ["GET", reportKey(existingId)]));
        return stored[0] ?? report;
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
        return stored[0] ?? report;
      }
      await redis(url, token, ["SET", reportKey(report.id), JSON.stringify(report)]);
      await redis(url, token, ["ZADD", INDEX_KEY, String(Date.parse(report.createdAt)), report.id]);
      return report;
    },
  };
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

function reportKey(id: string) {
  return `chegola:report:${id}`;
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
  return { reports: [], idempotency: {} };
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
