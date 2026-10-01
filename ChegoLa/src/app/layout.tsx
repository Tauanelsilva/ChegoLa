import type { Metadata } from "next";
import { Nunito_Sans, Outfit } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Chegolá? | Alagamentos em Itaúna",
    template: "%s | Chegolá?",
  },
  description:
    "Chegolá? reúne referências oficiais históricas e relatos colaborativos locais sobre alagamentos em Itaúna, sem monitoramento em tempo real.",
  applicationName: "Chegolá?",
  icons: {
    icon: "/icon.png",
  },
  openGraph: {
    title: "Chegolá?",
    description: "Pra você chegar lá, comece por aqui.",
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${nunito.variable} ${outfit.variable}`}>
      <body className="flex min-h-screen flex-col antialiased">
        <a
          href="#conteudo"
          className="skip-link"
        >
          Ir para o conteúdo
        </a>
        <SiteHeader />
        <main id="conteudo" className="min-w-0 flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
