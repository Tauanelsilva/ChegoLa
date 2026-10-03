"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, CloudUpload, MapPinCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCommunityReport } from "@/lib/community-reports";
import { geocodeLocation } from "@/lib/map-services";
import {
  OCCURRENCES_CHANGED_EVENT,
  type Occurrence,
  type RiskLevel,
} from "@/lib/occurrences";

type SubmitState = "idle" | "geocoding" | "saving" | "error";

export function OccurrenceForm() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const busy = submitState === "geocoding" || submitState === "saving";

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
      nextErrors.description = "Descreva a situação com pelo menos 20 caracteres.";
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
      await submitCommunityReport(occurrence);
      window.dispatchEvent(new Event(OCCURRENCES_CHANGED_EVENT));
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

  return (
    <Card className="mt-8 shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={submit} noValidate className="min-w-0 space-y-8">
          <fieldset className="space-y-4">
            <legend className="mb-3 font-heading text-lg font-semibold">1. Onde aconteceu?</legend>
            <TextField id="location" name="location" label="Local da ocorrência *" placeholder="Rua, número ou ponto de referência" error={errors.location} hint="Endereço em Itaúna/MG ou coordenadas como -20.0756, -44.5764. Não inclua nome ou contato." />
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <TextField id="region" name="region" label="Bairro ou região *" placeholder="Ex.: Centro" error={errors.region} />
              <div className="min-w-0 space-y-2">
                <Label htmlFor="risk">Nível observado *</Label>
                <select id="risk" name="risk" defaultValue="" aria-invalid={!!errors.risk} className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition-shadow focus-visible:ring-3 focus-visible:ring-ring/50">
                  <option value="" disabled>Selecione</option>
                  <option value="Baixo">Baixo</option>
                  <option value="Médio">Médio</option>
                  <option value="Alto">Alto</option>
                </select>
                <FieldError message={errors.risk} />
              </div>
            </div>
          </fieldset>

          <fieldset className="space-y-4">
            <legend className="mb-3 font-heading text-lg font-semibold">2. Quando aconteceu?</legend>
            <div className="grid min-w-0 gap-4 sm:grid-cols-2">
              <TextField id="date" name="date" label="Data *" type="date" max={new Date().toISOString().slice(0, 10)} error={errors.date} />
              <TextField id="time" name="time" label="Horário *" type="time" error={errors.time} />
            </div>
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="mb-3 flex w-full items-center justify-between gap-3 font-heading text-lg font-semibold">
              3. Descreva o que aconteceu
              <span className="text-xs font-sans font-medium text-muted-foreground">{description.length}/500</span>
            </legend>
            <Textarea id="description" name="description" maxLength={500} rows={6} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Conte o que você observou e o nível da água…" aria-invalid={!!errors.description} />
            <FieldError message={errors.description} />
          </fieldset>

          <fieldset className="space-y-2">
            <legend className="mb-3 font-heading text-lg font-semibold">4. Foto ou vídeo (opcional)</legend>
            <label htmlFor="media" className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 px-4 text-center transition-colors hover:border-cyan-500 focus-within:border-cyan-600 focus-within:ring-2 focus-within:ring-cyan-600/30">
              <CloudUpload className="mb-2 size-8 text-cyan-700" aria-hidden="true" />
              <span className="font-semibold">Escolher arquivo</span>
              <span className="text-xs text-muted-foreground">Validado até 50 MB, mas não armazenado nesta versão</span>
            </label>
            <input id="media" name="media" type="file" accept="image/*,video/*" className="sr-only" />
            <FieldError message={errors.media} />
          </fieldset>

          {submitState === "error" && (
            <Alert variant="destructive" role="alert">
              <AlertCircle />
              <AlertTitle>Não foi possível salvar</AlertTitle>
              <AlertDescription>{submitError} Revise o endereço e tente novamente.</AlertDescription>
            </Alert>
          )}
          {submitState === "geocoding" && (
            <p className="flex items-center gap-2 text-sm font-semibold text-cyan-800" role="status">
              <MapPinCheck className="size-5" aria-hidden="true" /> Localizando o endereço em Itaúna…
            </p>
          )}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link href="/ocorrencias" className={buttonVariants({ variant: "outline", size: "lg", className: "min-h-11" })}>
              Cancelar
            </Link>
            <Button type="submit" size="lg" className="min-h-11 bg-cyan-700 hover:bg-cyan-800" disabled={busy}>
              {busy ? "Salvando…" : "Salvar ocorrência"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

type TextFieldProps = {
  id: string;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  max?: string;
  error?: string;
  hint?: string;
};

function TextField({ id, name, label, placeholder, type = "text", max, error, hint }: TextFieldProps) {
  return (
    <div className="min-w-0 space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} name={name} type={type} max={max} placeholder={placeholder} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} className="h-11" />
      {hint && <p id={`${id}-hint`} className="text-xs text-muted-foreground">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return <p id={id} className="text-sm font-semibold text-red-700">{message}</p>;
}
