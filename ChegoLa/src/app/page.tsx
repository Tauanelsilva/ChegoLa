import Link from "next/link";
import { ArrowRight, MapPinned, Megaphone, Route, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const steps = [
    { icon: MapPinned, title: "Visualize", text: "Explore pontos simulados de atenção no mapa de Itaúna." },
    { icon: ShieldAlert, title: "Confira", text: "Veja o nível de risco e a atualização de cada ocorrência." },
    { icon: Megaphone, title: "Colabore", text: "Informe um alagamento por meio do formulário demonstrativo." },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 py-20 text-white md:py-28">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_70%_25%,#0891b2_0,transparent_35%),radial-gradient(circle_at_90%_80%,#f59e0b_0,transparent_22%)]" />
        <div className="page-shell relative grid items-center gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <Badge className="mb-6 border-cyan-500/40 bg-cyan-500/10 text-cyan-200">Demonstração com dados simulados</Badge>
            <h1 className="font-heading text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
              A chuva chegou.<br /><span className="text-cyan-400">E a água, chegou lá?</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Consulte pontos de atenção e compartilhe ocorrências de alagamento em Itaúna.
              Informação colaborativa para decisões mais conscientes.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/mapa" className={buttonVariants({ size: "lg", className: "bg-amber-500 text-slate-950 hover:bg-amber-400" })}>Explorar o mapa <ArrowRight /></Link>
              <Link href="/informar" className={buttonVariants({ size: "lg", variant: "outline", className: "border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white" })}>Informar ocorrência</Link>
            </div>
          </div>

          <div className="relative min-h-96 overflow-hidden rounded-3xl border border-white/10 bg-cyan-950 shadow-2xl">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(25deg,transparent_45%,#67e8f9_46%,#67e8f9_47%,transparent_48%),linear-gradient(115deg,transparent_48%,#155e75_49%,#155e75_51%,transparent_52%)] [background-size:90px_90px]" />
            {[
              ["top-[23%] left-[30%]", "Alto"],
              ["top-[55%] left-[68%]", "Médio"],
              ["top-[72%] left-[25%]", "Alto"],
            ].map(([position, label]) => (
              <div key={position} className={`absolute ${position} flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-slate-900 shadow-lg`}>
                <span className="size-3 rounded-full bg-amber-500 ring-4 ring-amber-500/25" /> {label}
              </div>
            ))}
            <div className="absolute bottom-5 left-5 rounded-xl bg-slate-950/85 px-4 py-3">
              <p className="text-xs uppercase tracking-widest text-cyan-300">Mapa demonstrativo</p>
              <p className="mt-1 font-semibold">Itaúna, Minas Gerais</p>
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-bold uppercase tracking-[.2em] text-cyan-700">Como funciona</p>
          <h2 className="section-title mt-3">Informação útil em três passos</h2>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-0 bg-white shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-5 grid size-12 place-items-center rounded-xl bg-cyan-50 text-cyan-700"><Icon className="size-6" /></div>
                <h3 className="font-heading text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-cyan-800 py-14 text-white">
        <div className="page-shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="font-heading text-2xl font-semibold">Encontrou uma área alagada?</p>
            <p className="mt-2 text-cyan-100">Sua informação pode ajudar outras pessoas. Este envio é apenas simulado.</p>
          </div>
          <Link href="/informar" className={buttonVariants({ size: "lg", className: "bg-white text-cyan-900 hover:bg-cyan-50" })}><Route /> Informar agora</Link>
        </div>
      </section>
    </>
  );
}
