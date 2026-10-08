import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, test } from "node:test";
import type { Occurrence } from "@/lib/occurrences";
import { getReportStore, ReportStoreError } from "@/server/reports/report-store";

const directory = await mkdtemp(path.join(tmpdir(), "chegola-reports-"));
process.env.CHEGOLA_REPORTS_PATH = path.join(directory, "reports.json");

after(async () => {
  await rm(directory, { recursive: true, force: true });
});

function report(id: string): Occurrence {
  return {
    id,
    place: "Rua de teste",
    region: "Centro",
    risk: "Baixo",
    description: "Relato criado só para testar a exclusão.",
    date: "2026-10-08",
    time: "10:00",
    latitude: -20.0756,
    longitude: -44.5764,
    source: "Relato local",
    createdAt: "2026-10-08T13:00:00.000Z",
  };
}

test("apaga o relato de quem enviou e também um relato antigo sem token", async () => {
  const store = getReportStore();
  const id = "11111111-1111-4111-8111-111111111111";
  const saved = await store.save(report(id), id);

  assert.equal(typeof saved.deleteToken, "string");
  assert.deepEqual(await store.unprotectedIds(), []);

  await assert.rejects(
    () => store.remove(id, "token-errado"),
    (error: unknown) => error instanceof ReportStoreError && error.status === 403,
  );
  assert.equal((await store.list()).length, 1);

  await store.remove(id, saved.deleteToken ?? "");
  assert.equal((await store.list()).length, 0);
  await store.remove(id, saved.deleteToken ?? "");

  const legacyId = "22222222-2222-4222-8222-222222222222";
  await writeFile(
    process.env.CHEGOLA_REPORTS_PATH ?? "",
    JSON.stringify({ reports: [report(legacyId)], idempotency: { [legacyId]: legacyId } }),
  );
  assert.deepEqual(await store.unprotectedIds(), [legacyId]);
  await store.remove(legacyId, "");
  assert.equal((await store.list()).length, 0);

  await store.hide("oficial-jove-soares-prainha");
  await store.hide("oficial-jove-soares-prainha");
  assert.deepEqual(await store.hiddenIds(), ["oficial-jove-soares-prainha"]);
});
