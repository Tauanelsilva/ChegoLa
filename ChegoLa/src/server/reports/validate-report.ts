import type { Occurrence } from "@/lib/occurrences";

const ITAUNA_BOUNDS = {
  south: -20.224406,
  north: -19.936,
  west: -44.718046,
  east: -44.445,
};

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export class ReportError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function validateCommunityReport(
  input: unknown,
  idempotencyKey: string | null,
): Occurrence {
  if (!input || typeof input !== "object") {
    throw new ReportError("Envie os dados da ocorrência.", 400);
  }
  const body = input as Record<string, unknown>;
  const id = readText(body.id, 36);
  if (!UUID.test(id) || id !== idempotencyKey) {
    throw new ReportError("A chave de envio da ocorrência é inválida.", 400);
  }

  const place = readText(body.place, 160);
  const region = readText(body.region, 80);
  const description = readText(body.description, 500);
  const date = readText(body.date, 10);
  const time = readText(body.time, 5);
  const risk = readText(body.risk, 10);

  if (place.length < 3) throw new ReportError("Informe o local da ocorrência.", 400);
  if (region.length < 2) throw new ReportError("Informe o bairro ou região.", 400);
  if (description.length < 20) {
    throw new ReportError("Descreva a situação com pelo menos 20 caracteres.", 400);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todayInItauna()) {
    throw new ReportError("Informe uma data válida, até hoje.", 400);
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    throw new ReportError("Informe o horário.", 400);
  }
  if (risk !== "Baixo" && risk !== "Médio" && risk !== "Alto") {
    throw new ReportError("Selecione o nível observado.", 400);
  }

  const latitude = readCoordinate(body.latitude);
  const longitude = readCoordinate(body.longitude);
  if (
    latitude < ITAUNA_BOUNDS.south ||
    latitude > ITAUNA_BOUNDS.north ||
    longitude < ITAUNA_BOUNDS.west ||
    longitude > ITAUNA_BOUNDS.east
  ) {
    throw new ReportError("O ponto precisa estar em Itaúna/MG.", 400);
  }

  return {
    id,
    place,
    region,
    risk,
    description,
    date,
    time,
    latitude,
    longitude,
    source: "Relato local",
    createdAt: new Date().toISOString(),
    locationPrecision: "Trecho aproximado",
  };
}

function readText(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function readCoordinate(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : Number.NaN;
}

function todayInItauna() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
  }).format(new Date());
}
