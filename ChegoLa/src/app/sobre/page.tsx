import Link from "next/link";
import { BookOpen, HeartHandshake, Lightbulb, Map, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SobrePage() {
  return (
    <>
      <section className="bg-cyan-900 py-16 text-white md:py-24">
        <div className="page-shell grid items-center gap-10 md:grid-cols-2">
          <div>
            <Badge className="mb-4 bg-white/10 text-cyan-100">Projeto acadêmico • fontes identificadas</Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight md:text-6xl">Uma pergunta simples pode aproximar pessoas e informação.</h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-cyan-100">O Chegolá? nasce como proposta de mapeamento colaborativo de pontos de alagamento em Itaúna/MG.</p>
          </div>
          <div className="relative grid min-h-80 place-items-center overflow-hidden rounded-3xl bg-cyan-800">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle,#67e8f9_2px,transparent_2px)] [background-size:28px_28px]" />
            <div className="relative grid size-44 place-items-center rounded-full bg-white/10 ring-1 ring-white/20"><Map className="size-20 text-amber-400" /></div>
          </div>
        </div>
      </section>

      <section className="page-shell py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr]">
          <div><p className="font-bold uppercase tracking-[.2em] text-cyan-700">Sobre o projeto</p><h2 className="section-title mt-3">Tecnologia com propósito local</h2></div>
          <div className="space-y-5 text-lg leading-8 text-slate-600">
            <p>Em períodos de chuva, informações locais podem ajudar no planejamento de um deslocamento. O Chegolá? diferencia referências publicadas por órgãos oficiais de relatos colaborativos não verificados.</p>
            <p>Nesta primeira fatia funcional, há uma referência histórica da Prefeitura sobre a Avenida Jove Soares/Prainha. Novos relatos ficam no armazenamento local do navegador. Não há integração com a Defesa Civil, banco de dados, monitoramento em tempo real ou garantia de segurança.</p>
          </div>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {[
            { icon: Lightbulb, title: "Origem", text: "Uma pesquisa sobre desafios urbanos e comunicação em períodos de chuva." },
            { icon: Users, title: "Colaboração", text: "Participação cidadã pensada com clareza, responsabilidade e validação." },
            { icon: HeartHandshake, title: "Objetivo", text: "Facilitar o acesso a informações locais sem substituir canais oficiais." },
          ].map(({ icon: Icon, title, text }) => (
            <Card key={title}><CardContent className="pt-6"><Icon className="size-9 text-cyan-700" /><h3 className="mt-5 font-heading text-xl font-semibold">{title}</h3><p className="mt-2 leading-7 text-muted-foreground">{text}</p></CardContent></Card>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-amber-100 p-8 md:flex-row md:items-center md:p-12">
          <div><BookOpen className="mb-4 size-8 text-amber-700" /><h2 className="font-heading text-2xl font-semibold">Conheça o MVP funcional</h2><p className="mt-2 text-slate-700">Confira fonte, data e precisão dos pontos oficiais e diferencie-os dos relatos locais.</p></div>
          <Link href="/ocorrencias" className={buttonVariants({ size: "lg", className: "bg-slate-950" })}>Ver ocorrências</Link>
        </div>
      </section>
    </>
  );
}
