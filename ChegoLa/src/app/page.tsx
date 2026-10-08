import Link from "next/link";
import { ArrowRight, MapPinned, Megaphone, ShieldAlert } from "lucide-react";
import { HomeMapPreview } from "@/components/home-map-preview";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: MapPinned, title: "Visualize", text: "Veja no mapa os pontos de alagamento registrados em Itaúna." },
  { icon: ShieldAlert, title: "Confira", text: "Abra um ponto para ver o local, a fonte e a classificação." },
  { icon: Megaphone, title: "Colabore", text: "Informe um alagamento para ele aparecer no mapa." },
];

export default function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(circle_at_18%_20%,#0891b2_0,transparent_32%)]" />
        <div className="page-shell relative grid items-center gap-8 py-10 md:py-14 lg:grid-cols-2 lg:gap-12 lg:py-16">
          <div className="min-w-0">
            <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-tight md:text-5xl xl:text-6xl">
              Pra você chegar lá,
              <br />
              <span className="text-cyan-400">comece por aqui.</span>
            </h1>
            <span className="mt-6 block h-1 w-12 rounded-full bg-cyan-400" aria-hidden="true" />
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Veja os pontos de alagamento em Itaúna e escolha o caminho antes de sair.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/mapa" className={buttonVariants({ size: "lg", className: "min-h-11 bg-white! text-slate-950! hover:bg-cyan-50!" })}>
                Explorar o mapa <ArrowRight />
              </Link>
              <Link href="/informar" className={buttonVariants({ size: "lg", variant: "outline", className: "min-h-11 border-white/30 bg-white/5 text-white hover:bg-white/10 hover:text-white" })}>
                Informar ocorrência
              </Link>
            </div>
          </div>
          <HomeMapPreview />
        </div>
      </section>

      <section className="page-shell py-12 md:py-16" aria-labelledby="atualizacao-ruas">
        <article className="rounded-3xl border bg-white p-6 shadow-sm md:p-10">
          <p className="eyebrow">Atualização · 7 de outubro de 2026</p>
          <h2 id="atualizacao-ruas" className="section-title mt-3 text-balance">
            Ruas que faltavam no mapa agora estão escritas
          </h2>
          <div className="mt-6 max-w-3xl space-y-4 text-lg leading-8 text-slate-600">
            <p>
              291 vias urbanas de Itaúna que constam no Cadastro Nacional de Endereços do IBGE, do Censo 2022, e não tinham nome correspondente no OpenStreetMap passaram a aparecer no mapa.
            </p>
            <p>
              Cada uma entra como um traço escuro com o nome escrito, visível ao aproximar o zoom. Na Prainha, tratada no mapa como Bairro das Graças, isso inclui ruas como Gioconda Corradi e Benfica Magalhães e as praças do bairro.
            </p>
            <p>
              O marcador continua reservado aos pontos de alagamento. O traço segue os endereços do IBGE, então a posição é aproximada. A rota de carro continua pelas ruas que o OpenStreetMap consegue percorrer. Buscar uma dessas ruas pelo nome leva ao ponto aproximado.
            </p>
          </div>
          <Link
            href="/mapa"
            className={buttonVariants({ size: "lg", className: "mt-8 min-h-11 bg-cyan-700! text-white! hover:bg-cyan-800!" })}
          >
            Ver no mapa <ArrowRight />
          </Link>
        </article>
      </section>

      <section className="page-shell py-12 md:py-16" aria-labelledby="como-funciona">
        <div className="mx-auto max-w-2xl text-center">
          <p className="eyebrow">Como funciona</p>
          <h2 id="como-funciona" className="section-title mt-3">Informação útil em três passos</h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }) => (
            <Card key={title} className="border-0 bg-white shadow-sm transition duration-200 hover:shadow-md motion-safe:hover:-translate-y-1">
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
    </>
  );
}
