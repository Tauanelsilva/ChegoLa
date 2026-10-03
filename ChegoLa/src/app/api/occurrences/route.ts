import { NextRequest, NextResponse } from "next/server";
import { getReportStore } from "@/server/reports/report-store";
import { ReportError, validateCommunityReport } from "@/server/reports/validate-report";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_POSTS = 8;

const limiter = globalThis as typeof globalThis & {
  __chegolaReportHits?: Map<string, number[]>;
};

export async function GET() {
  try {
    const occurrences = await getReportStore().list();
    return NextResponse.json(
      { occurrences },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os relatos compartilhados." },
      { status: 503 },
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!allowPost(ip)) {
    return NextResponse.json(
      { error: "Muitos envios em seguida. Aguarde alguns minutos e tente de novo." },
      { status: 429 },
    );
  }

  try {
    const report = validateCommunityReport(
      await request.json(),
      request.headers.get("idempotency-key"),
    );
    const stored = await getReportStore().save(report, report.id);
    return NextResponse.json({ occurrence: stored }, { status: 201 });
  } catch (caught) {
    if (caught instanceof ReportError) {
      return NextResponse.json({ error: caught.message }, { status: caught.status });
    }
    if (caught instanceof SyntaxError) {
      return NextResponse.json({ error: "Envie os dados da ocorrência." }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Não foi possível compartilhar a ocorrência agora." },
      { status: 503 },
    );
  }
}

function allowPost(ip: string) {
  const hits = limiter.__chegolaReportHits ?? new Map<string, number[]>();
  limiter.__chegolaReportHits = hits;
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((timestamp) => now - timestamp < WINDOW_MS);
  if (recent.length >= MAX_POSTS) return false;
  recent.push(now);
  hits.set(ip, recent);
  return true;
}
