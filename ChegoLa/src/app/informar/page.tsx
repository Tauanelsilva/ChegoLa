"use client";

import { FormEvent, useState } from "react";
import { AlertCircle, CheckCircle2, CloudUpload, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Result = "idle" | "sending" | "success" | "error";

export default function InformarPage() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<Result>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const nextErrors: Record<string, string> = {};
    if (!String(form.get("location") ?? "").trim()) nextErrors.location = "Informe o local da ocorrência.";
    if (!form.get("date")) nextErrors.date = "Informe a data.";
    if (!form.get("time")) nextErrors.time = "Informe o horário.";
    if (description.trim().length < 20) nextErrors.description = "Descreva a situação com pelo menos 20 caracteres.";
    const file = form.get("media");
    if (file instanceof File && file.size > 50 * 1024 * 1024) nextErrors.media = "O arquivo deve ter no máximo 50 MB.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setResult("sending");
    const shouldFail = form.get("simulateError") === "on";
    window.setTimeout(() => setResult(shouldFail ? "error" : "success"), 900);
  }

  return (
    <div className="page-shell py-12">
      <div className="mx-auto max-w-3xl">
        <p className="font-bold uppercase tracking-[.2em] text-cyan-700">Participe</p>
        <h1 className="section-title mt-2">Informar uma ocorrência</h1>
        <p className="mt-3 leading-7 text-muted-foreground">Preencha os detalhes do alagamento. O envio é simulado: nenhuma informação ou mídia será armazenada.</p>

        <Alert className="mt-6 border-cyan-200 bg-cyan-50">
          <Info className="text-cyan-700" />
          <AlertTitle>Em caso de emergência</AlertTitle>
          <AlertDescription>Não dependa deste protótipo. Procure os canais oficiais e serviços de emergência.</AlertDescription>
        </Alert>

        <Card className="mt-8 shadow-sm">
          <CardHeader><CardTitle>Detalhes da ocorrência</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} noValidate className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="location">Local da ocorrência *</Label>
                <Input id="location" name="location" placeholder="Rua, número ou ponto de referência" aria-invalid={!!errors.location} aria-describedby={errors.location ? "location-error" : undefined} />
                {errors.location && <p id="location-error" className="text-sm font-semibold text-red-600">{errors.location}</p>}
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="date">Data *</Label><Input id="date" name="date" type="date" aria-invalid={!!errors.date} />{errors.date && <p className="text-sm font-semibold text-red-600">{errors.date}</p>}</div>
                <div className="space-y-2"><Label htmlFor="time">Horário *</Label><Input id="time" name="time" type="time" aria-invalid={!!errors.time} />{errors.time && <p className="text-sm font-semibold text-red-600">{errors.time}</p>}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between gap-3"><Label htmlFor="description">Descrição *</Label><span className="text-xs text-muted-foreground">{description.length}/500</span></div>
                <Textarea id="description" name="description" maxLength={500} rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Conte o que você observou, o nível da água e pontos de referência..." aria-invalid={!!errors.description} />
                {errors.description && <p className="text-sm font-semibold text-red-600">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="media">Foto ou vídeo (opcional)</Label>
                <label htmlFor="media" className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed bg-slate-50 px-4 text-center hover:border-cyan-500">
                  <CloudUpload className="mb-2 size-8 text-cyan-700" />
                  <span className="font-semibold">Escolher arquivo</span>
                  <span className="text-xs text-muted-foreground">Imagem ou vídeo, até 50 MB • não será enviado</span>
                </label>
                <Input id="media" name="media" type="file" accept="image/*,video/*" className="sr-only" />
                {errors.media && <p className="text-sm font-semibold text-red-600">{errors.media}</p>}
              </div>

              <label className="flex items-start gap-3 rounded-lg bg-slate-50 p-4 text-sm">
                <input type="checkbox" name="simulateError" className="mt-1 size-4 accent-cyan-700" />
                <span><strong>Simular falha no envio</strong><br /><span className="text-muted-foreground">Marque para testar o estado de erro deste protótipo.</span></span>
              </label>

              {result === "success" && <Alert className="border-emerald-300 bg-emerald-50"><CheckCircle2 className="text-emerald-700" /><AlertTitle>Simulação concluída!</AlertTitle><AlertDescription>Os dados foram validados, mas não foram armazenados nem enviados.</AlertDescription></Alert>}
              {result === "error" && <Alert variant="destructive"><AlertCircle /><AlertTitle>Envio simulado indisponível</AlertTitle><AlertDescription>Nenhum dado foi perdido ou armazenado. Desmarque a simulação de falha e tente novamente.</AlertDescription></Alert>}

              <Button type="submit" size="lg" className="w-full bg-cyan-700 hover:bg-cyan-800" disabled={result === "sending"}>
                {result === "sending" ? "Simulando envio..." : "Enviar ocorrência (simulação)"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
