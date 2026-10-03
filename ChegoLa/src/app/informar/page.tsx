import { Info, ShieldAlert } from "lucide-react";
import { OccurrenceForm } from "@/components/occurrence-form";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InformarPage() {
  return (
    <div className="page-shell min-w-0 py-8 md:py-12">
      <PageBreadcrumb
        items={[
          { href: "/", label: "Início" },
          { label: "Informar ocorrência" },
        ]}
      />
      <div className="mt-4 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="min-w-0">
          <p className="eyebrow">Participe</p>
          <h1 className="section-title mt-2">Informar uma ocorrência</h1>
          <p className="mt-3 max-w-2xl leading-7 text-muted-foreground">
            O relato entra na lista e no mapa para quem acessar o site. O
            endereço é geocodificado para criar o ponto.
          </p>
          <Alert className="mt-6 border-cyan-200 bg-cyan-50">
            <Info className="text-cyan-700" />
            <AlertTitle>Em caso de emergência</AlertTitle>
            <AlertDescription>
              Não dependa deste aplicativo. Procure os canais oficiais e os
              serviços de emergência. Não envie dados pessoais.
            </AlertDescription>
          </Alert>
          <OccurrenceForm />
        </div>
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 text-sm leading-6 text-cyan-950">
            <p className="font-heading text-base font-semibold">O que acontece com o relato</p>
            <p className="mt-2">
              Ele aparece na lista e no mapa deste site. Não é validado por
              órgão oficial.
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
            <p className="flex items-center gap-2 font-heading text-base font-semibold">
              <ShieldAlert className="size-5 text-amber-700" aria-hidden="true" />
              Sem monitoramento ao vivo
            </p>
            <p className="mt-2">
              Um ponto no mapa é uma referência ou um relato local. Não indica
              se a via está alagada neste momento.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
