# Chegolá?

Fatia demonstrável de uma aplicação web colaborativa sobre pontos de alagamento em Itaúna/MG. Inclui cinco fluxos responsivos: Início, Mapa Interativo, Ocorrências, Informar ocorrência e Sobre o Projeto.

> Todos os endereços, riscos, rotas e horários exibidos são simulados. O projeto não usa banco, autenticação, API de mapas ou serviços externos e não deve orientar deslocamentos reais.

## Tecnologias

- Next.js (App Router) e React
- TypeScript
- Tailwind CSS
- shadcn/ui e Lucide

## Executar localmente

Requisitos: Node.js 20.9 ou superior e npm.

```bash
npm install
npm run dev
```

Abra `http://localhost:3000`. Para usar a porta configurada nesta demonstração:

```bash
npm run dev -- --hostname 0.0.0.0 --port 43127
```

## Verificar

```bash
npm run lint
npm run build
```

## Estados demonstráveis

- **Mapa:** deixe origem ou destino vazio para validar erro; preencha ambos para ver carregamento e rota simulada.
- **Ocorrências:** use os botões no topo para alternar entre dados, carregando, vazio e erro.
- **Formulário:** envie campos inválidos para ver validações; preencha corretamente para sucesso; marque “Simular falha no envio” para testar erro.

## Documentação

- [`docs/prompt-inicial.md`](docs/prompt-inicial.md): prompt mestre para sessões de desenvolvimento.
- [`docs/kanban.md`](docs/kanban.md): plano Kanban de três semanas com ordem e critérios de aceite.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
