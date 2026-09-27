"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CloudUpload, Info, MapPinCheck } from "lucide-react";
import { geocodeLocation } from "@/lib/map-services";
import {
  saveLocalOccurrence,
  type Occurrence,
  type RiskLevel,
} from "@/lib/occurrences";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SubmitState = "idle" | "geocoding" | "saving" | "error";

export default function InformarPage() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const place = String(form.get("location") ?? "").trim();
    const region = String(form.get("region") ?? "").trim();
    const date = String(form.get("date") ?? "");
    const time = String(form.get("time") ?? "");
    const risk = String(form.get("risk") ?? "") as RiskLevel;
    const nextErrors: Record<string, string> = {};

    if (!place) nextErrors.location = "Informe o local da ocorrência.";
    if (!region) nextErrors.region = "Informe o bairro ou região.";
    if (!date) nextErrors.date = "Informe a data.";
    if (!time) nextErrors.time = "Informe o horário.";
    if (!["Baixo", "Médio", "Alto"].includes(risk)) {
      nextErrors.risk = "Selecione o nível observado.";
    }
    if (description.trim().length < 20) {
      nextErrors.description =
        "Descreva a situação com pelo menos 20 caracteres.";
    }
    const file = form.get("media");
    if (file instanceof File && file.size > 50 * 1024 * 1024) {
      nextErrors.media = "O arquivo deve ter no máximo 50 MB.";
    }

    setErrors(nextErrors);
    setSubmitError("");
    if (Object.keys(nextErrors).length) {
      setSubmitState("idle");
      return;
    }

    try {
      setSubmitState("geocoding");
      const coordinates = await geocodeLocation(place);
      setSubmitState("saving");
      const occurrence: Occurrence = {
        id: crypto.randomUUID(),
        place,
        region,
        risk,
        description: description.trim(),
        date,
        time,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        source: "Relato local",
        createdAt: new Date().toISOString(),
      };
      saveLocalOccurrence(occurrence);
      router.push("/ocorrencias?created=1");
    } catch (caught) {
      setSubmitError(
        caught instanceof Error
          ? caught.message
          : "Não foi possível salvar a ocorrência.",
      );
      setSubmitState("error");
    }
  }

  const busy = submitState === "geocoding" || submitState === "saving";

  return (
    <div className="page-shell py-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-bold uppercase tracking-[.2em] text-cyan-700">
          Participe
        </p>
        <h1 className="section-title mt-2">Informar uma ocorrência</h1>
        <p className="mt-3 leading-7 text-muted-foreground">
          O relato fica somente no localStorage deste navegador. O endereço é
          geocodificado por um serviço público para criar o ponto no mapa.
        </p>

        <Alert className="mt-6 border-cyan-200 bg-cyan-50">
          <Info className="text-cyan-700" />
          <AlertTitle>Em caso de emergência</AlertTitle>
          <AlertDescription>
            Não dependa deste aplicativo. Procure os canais oficiais e serviços
            de emergência. Não envie dados pessoais.
          </AlertDescription>
        </Alert>

        <Card className="mt-8 shadow-sm">
          <CardHeader>
            <CardTitle>Detalhes da ocorrência</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} noValidate className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Local da ocorrência *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Rua, número ou ponto de referência"
                  aria-invalid={!!errors.location}
                  aria-describedby={
                    errors.location ? "location-error" : "location-help"
                  }
                />
                <p id="location-help" className="text-xs text-muted-foreground">
                  Informe um endereço em Itaúna/MG ou coordenadas como
                  -20.0756, -44.5764. Não inclua nome ou contato.
                </p>
                {errors.location && (
                  <p
                    id="location-error"
                    className="text-sm font-semibold text-red-600"
                  >
                    {errors.location}
                  </p>
                )}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="region">Bairro ou região *</Label>
                  <Input
                    id="region"
                    name="region"
                    placeholder="Ex.: Centro"
                    aria-invalid={!!errors.region}
                  />
                  {errors.region && (
                    <p className="text-sm font-semibold text-red-600">
                      {errors.region}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="risk">Nível observado *</Label>
                  <select
                    id="risk"
                    name="risk"
                    defaultValue=""
                    aria-invalid={!!errors.risk}
                    className="h-9 w-full rounded-lg border bg-background px-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="Baixo">Baixo</option>
                    <option value="Médio">Médio</option>
                    <option value="Alto">Alto</option>
                  </select>
                  {errors.risk && (
                    <p className="text-sm font-semibold text-red-600">
                      {errors.risk}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    max={new Date().toISOString().slice(0, 10)}
                    aria-invalid={!!errors.date}
                  />
                  {errors.date && (
                    <p className="text-sm font-semibold text-red-600">
                      {errors.date}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Horário *</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    aria-invalid={!!errors.time}
                  />
                  {errors.time && (
                    <p className="text-sm font-semibold text-red-600">
                      {errors.time}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between gap-3">
                  <Label htmlFor="description">Descrição *</Label>
                  <span className="text-xs text-muted-foreground">
                    {description.length}/500
                  </span>
                </div>
                <Textarea
                  id="description"
                  name="description"
                  maxLength={500}
                  rows={6}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Conte o que você observou e o nível da água…"
                  aria-invalid={!!errors.description}
                />
                {errors.description && (
                  <p className="text-sm font-semibold text-red-600">
                    {errors.description}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="media">Foto ou vídeo (opcional)</Label>
                <label
                  htmlFor="media"
                  className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 px-4 text-center hover:border-cyan-500"
                >
                  <CloudUpload className="mb-2 size-8 text-cyan-700" />
                  <span className="font-semibold">Escolher arquivo</span>
                  <span className="text-xs text-muted-foreground">
                    Validado até 50 MB, mas não armazenado nesta versão
                  </span>
                </label>
                <Input
                  id="media"
                  name="media"
                  type="file"
                  accept="image/*,video/*"
                  className="sr-only"
                />
                {errors.media && (
                  <p className="text-sm font-semibold text-red-600">
                    {errors.media}
                  </p>
                )}
              </div>

              {submitState === "error" && (
                <Alert variant="destructive" role="alert">
                  <AlertCircle />
                  <AlertTitle>Não foi possível salvar</AlertTitle>
                  <AlertDescription>
                    {submitError} Revise o endereço e tente novamente. Nenhum
                    dado foi enviado a um backend.
                  </AlertDescription>
                </Alert>
              )}

              {submitState === "geocoding" && (
                <p
                  className="flex items-center gap-2 text-sm font-semibold text-cyan-800"
                  role="status"
                >
                  <MapPinCheck className="size-5" /> Localizando o endereço em
                  Itaúna…
                </p>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full bg-cyan-700 hover:bg-cyan-800"
                disabled={busy}
              >
                {busy ? "Salvando neste navegador…" : "Salvar ocorrência"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
