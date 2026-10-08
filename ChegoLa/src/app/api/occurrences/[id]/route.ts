import { NextRequest, NextResponse } from "next/server";
import { OFFICIAL_OCCURRENCE_ID } from "@/lib/occurrences";
import { getReportStore, ReportStoreError } from "@/server/reports/report-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const WINDOW_MS = 10 * 60 * 1000;
const MAX_DELETES = 20;

const limiter = globalThis as typeof globalThis & {
  __chegolaDeleteHits?: Map<string, number[]>;
};

export async function DELETE(
  request: NextRequest,
  context: RouteContext<"/api/occurrences/[id]">,
) {
  const { id } = await context.params;
  if (id !== OFFICIAL_OCCURRENCE_ID && !UUID.test(id)) {
    return NextResponse.json(
      { error: "Este ponto não pode ser apagado." },
      { status: 403 },
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowDelete(ip)) {
    return NextResponse.json(
      { error: "Muitas exclusões em seguida. Aguarde alguns minutos e tente de novo." },
      { status: 429 },
    );
  }

  try {
    const store = getReportStore();
    if (id === OFFICIAL_OCCURRENCE_ID) await store.hide(id);
    else await store.remove(id, request.headers.get("x-delete-token") ?? "");
    return new NextResponse(null, { status: 204 });
  } catch (caught) {
    if (caught instanceof ReportStoreError) {
      return NextResponse.json({ error: caught.message }, { status: caught.status });
    }
    return NextResponse.json(
      { error: "Não foi possível apagar o relato agora." },
      { status: 503 },
    );
  }
}

function allowDelete(ip: string) {
  const hits = limiter.__chegolaDeleteHits ?? new Map<string, number[]>();
  limiter.__chegolaDeleteHits = hits;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_DELETES) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}
