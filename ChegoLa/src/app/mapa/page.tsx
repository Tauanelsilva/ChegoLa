"use client";

import { useState } from "react";
import { ArrowDownUp, CircleAlert, LocateFixed, MapPin, Navigation, ZoomIn, ZoomOut } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function MapaPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");

  function calculate() {
    if (!origin.trim() || !destination.trim()) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 900);
  }

  function swap() {
    setOrigin(destination);
    setDestination(origin);
  }

  return (
    <div className="page-shell py-10">
      <div className="mb-8">
        <Badge variant="outline" className="mb-3 border-amber-300 bg-amber-50 text-amber-800">Mapa visual • dados simulados</Badge>
        <h1 className="section-title">Mapa interativo</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Planeje uma rota demonstrativa e veja alertas fictícios. Este protótipo não usa GPS, API de mapas nem dados oficiais.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit">
          <CardContent className="space-y-5 pt-6">
            <div className="space-y-2">
              <Label htmlFor="origin">Origem</Label>
              <div className="relative"><MapPin className="absolute left-3 top-2.5 size-5 text-cyan-700" /><Input id="origin" className="pl-10" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Ex.: Praça da Matriz" /></div>
            </div>
            <Button type="button" variant="ghost" size="sm" className="w-full" onClick={swap}><ArrowDownUp /> Inverter pontos</Button>
            <div className="space-y-2">
              <Label htmlFor="destination">Destino</Label>
              <div className="relative"><Navigation className="absolute left-3 top-2.5 size-5 text-amber-600" /><Input id="destination" className="pl-10" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex.: Bairro Santanense" /></div>
            </div>
            <Button className="w-full bg-cyan-700 hover:bg-cyan-800" onClick={calculate} disabled={status === "loading"}>
              {status === "loading" ? "Calculando demonstração..." : "Calcular rota"}
            </Button>
            {status === "error" && <p role="alert" className="text-sm font-semibold text-red-600">Preencha origem e destino.</p>}
            {status === "ready" && (
              <Alert className="border-amber-300 bg-amber-50">
                <CircleAlert className="text-amber-700" />
                <AlertTitle>Rota calculada (simulação)</AlertTitle>
                <AlertDescription>12 min • 4,8 km. Há um ponto fictício de atenção no trajeto.</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="relative min-h-[560px] overflow-hidden rounded-2xl border bg-[#dcebdc] shadow-sm">
          <div className="absolute inset-0 [background-image:linear-gradient(35deg,transparent_44%,#b7c9b2_45%,#b7c9b2_48%,transparent_49%),linear-gradient(125deg,transparent_43%,#fff_44%,#fff_47%,transparent_48%)] [background-size:120px_100px]" />
          <div className="absolute left-[8%] top-[15%] h-[3px] w-[75%] rotate-[23deg] rounded-full bg-cyan-700 shadow-[0_0_0_3px_white]" />
          {[
            ["left-[28%] top-[31%]", "Alto", "bg-red-500"],
            ["left-[61%] top-[46%]", "Médio", "bg-amber-500"],
            ["left-[72%] top-[68%]", "Baixo", "bg-cyan-600"],
          ].map(([position, label, color]) => (
            <div key={position} className={`absolute ${position} group`}>
              <span className={`grid size-9 place-items-center rounded-full ${color} text-white shadow-lg ring-4 ring-white`}><MapPin className="size-5" /></span>
              <span className="absolute left-1/2 top-11 -translate-x-1/2 rounded bg-slate-900 px-2 py-1 text-xs font-bold text-white">{label}</span>
            </div>
          ))}
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            {[ZoomIn, ZoomOut, LocateFixed].map((Icon, index) => <Button key={index} size="icon" variant="outline" className="bg-white" aria-label={["Aumentar zoom", "Diminuir zoom", "Minha localização"][index]}><Icon /></Button>)}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-3 rounded-xl bg-white/95 p-3 text-xs font-semibold shadow">
            <span className="mr-2 text-slate-500">Legenda simulada:</span>
            <span><i className="mr-1 inline-block size-2 rounded-full bg-red-500" /> Risco alto</span>
            <span><i className="mr-1 inline-block size-2 rounded-full bg-amber-500" /> Risco médio</span>
            <span><i className="mr-1 inline-block size-2 rounded-full bg-cyan-600" /> Risco baixo</span>
          </div>
        </div>
      </div>
    </div>
  );
}
