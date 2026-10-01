import Link from "next/link";
import { BookOpen, HeartHandshake, Lightbulb, Users } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { PageBreadcrumb } from "@/components/page-breadcrumb";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function SobrePage() {
  return (
    <>
      <section className="overflow-x-clip bg-cyan-900 text-white" aria-labelledby="hero-sobre">
        <div className="page-shell grid min-w-0 items-stretch gap-8 py-12 md:grid-cols-2 md:gap-12 md:py-20 lg:gap-16 lg:py-24">
          <div className="flex min-w-0 flex-col justify-center">
            <PageBreadcrumb
              tone="inverse"
              className="mb-6"
              items={[
                { href: "/", label: "Início" },
                { label: "Sobre o projeto" },
              ]}
            />
            <Badge className="mb-6 w-fit bg-white/10 text-cyan-100">Projeto acadêmico • fontes identificadas</Badge>
            <h1 id="hero-sobre" className="text-balance font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl xl:text-6xl">
              Uma pergunta simples pode aproximar pessoas e informação.
            </h1>
            <span className="mt-6 block h-1 w-12 rounded-full bg-amber-400" aria-hidden="true" />
            <p className="mt-6 max-w-xl text-pretty text-lg leading-8 text-cyan-100">
              O Chegolá? nasce como proposta de mapeamento colaborativo de pontos de alagamento em Itaúna/MG.
            </p>
            <div className="mt-8">
              <Link
                href="/informar"
                className={buttonVariants({
                  size: "lg",
                  className: "min-h-11 rounded-full bg-white! px-6 text-slate-950! transition-colors hover:bg-cyan-50! focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-cyan-900",
                })}
              >
                Informar ocorrência
              </Link>
            </div>
          </div>
          <div className="flex min-h-72 min-w-0 items-center justify-center">
            <div className="rounded-3xl bg-white px-8 py-6 shadow-[0_16px_40px_-20px_rgba(2,6,23,0.45)]">
              <BrandLogo align="center" className="w-56 sm:w-72" />
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell min-w-0 py-16 md:py-24" aria-labelledby="sobre-projeto">
        <div className="max-w-3xl">
          <p className="eyebrow">Sobre o projeto</p>
          <h2 id="sobre-projeto" className="section-title mt-3 text-balance">Tecnologia com propósito local</h2>
          <div className="mt-6 space-y-5 text-pretty text-lg leading-8 text-slate-600">
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
            <Card key={title} className="border-0 bg-white shadow-sm">
              <CardContent className="pt-6">
                <div className="mb-4 grid size-12 place-items-center rounded-xl bg-cyan-50 text-cyan-800">
                  <Icon className="size-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading text-xl font-semibold">{title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="page-shell">
        <div className="flex flex-col justify-between gap-6 rounded-3xl bg-amber-100 p-8 md:flex-row md:items-center md:p-12">
          <div><BookOpen className="mb-4 size-8 text-amber-700" /><h2 className="font-heading text-2xl font-semibold">Conheça o MVP funcional</h2><p className="mt-2 text-slate-700">Confira fonte, data e precisão dos pontos oficiais e diferencie-os dos relatos locais.</p></div>
          <Link href="/ocorrencias" className={buttonVariants({ size: "lg", className: "min-h-11 bg-slate-950! text-white! hover:bg-slate-800!" })}>Ver ocorrências</Link>
        </div>
      </section>
    </>
  );
}
