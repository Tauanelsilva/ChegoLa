# Chegolá?

MVP funcional de uma aplicação web colaborativa sobre pontos de alagamento em Itaúna/MG. Inclui cinco fluxos responsivos: Início, Mapa Interativo, Ocorrências, Informar ocorrência e Sobre o Projeto.

> Os pontos iniciais são demonstrativos e os relatos criados não são verificados. A rota calculada não é uma rota segura e não deve substituir orientações oficiais.

## Tecnologias

- Next.js (App Router) e React
- TypeScript
- Tailwind CSS
- shadcn/ui e Lucide
- MapLibre GL JS

## Como os dados funcionam

- Relatos criados são geocodificados e persistidos apenas no `localStorage` do navegador.
- Não há banco, autenticação, upload de mídia, telemetria ou segredo.
- O mapa usa tiles raster do OpenStreetMap com atribuição; se eles falharem, tenta uma base CARTO com dados OpenStreetMap e mostra o fallback.
- Endereços passam por um Route Handler do Next.js que consulta Nominatim no servidor, prioriza Itaúna, tenta variações, limita frequência e aplica cache.
- Rotas usam o servidor público de demonstração do OSRM.
- Os serviços públicos podem impor limites ou ficar indisponíveis; não são adequados para uma operação de produção sem contrato e infraestrutura próprios.
- “Atual” significa consulta feita no momento da ação. Não há fonte oficial ou monitoramento de alagamentos em tempo real.
- Supabase/Realtime poderia sincronizar registros entre clientes, mas ainda exigiria moderação e uma fonte validada para representar condições reais.

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

Os scripts `postinstall`, `predev` e `prebuild` sincronizam o worker ESM do MapLibre com `public/`. Isso evita diferenças entre Windows, Turbopack e Vercel.

## Publicar na Vercel

- Se `package.json` está na raiz do repositório, mantenha **Root Directory** como `.`. O nome da pasta local `ChegoLa` no Windows não altera essa configuração.
- Se o repositório contiver `ChegoLa/package.json`, selecione **Root Directory: `ChegoLa`**.
- Use `npm ci` para instalar e `npm run build` para compilar.
- A Vercel fornece uma URL `*.vercel.app`. Domínio próprio é opcional, comprado separadamente e configurado em **Settings → Domains**.
- Consulte os limites e preços atuais da Vercel; o plano gratuito possui cotas e não cobre custos ou garantias dos serviços externos.

Veja o plano detalhado em [`docs/proximos-passos.md`](docs/proximos-passos.md).

## Fluxos para verificar

- **Mapa:** calcule uma rota entre dois endereços de Itaúna ou coordenadas; confira traçado, distância, duração e alerta de ocorrências próximas.
- **Ocorrências:** busque por texto e filtre por risco ou origem; uma busca sem resultado exibe o estado vazio.
- **Formulário:** valide campos, salve um endereço localizável em Itaúna e confirme o novo relato na lista e no mapa.
- **Erro:** bloqueio ou corrupção do `localStorage` produz estado de erro recuperável; falhas de tiles OSM/CARTO, Nominatim ou OSRM apresentam mensagens sem inventar resultados.

## Documentação

- [`docs/prompt-inicial.md`](docs/prompt-inicial.md): prompt mestre para sessões de desenvolvimento.
- [`docs/kanban.md`](docs/kanban.md): plano Kanban de três semanas com ordem e critérios de aceite.
- [`docs/proximos-passos.md`](docs/proximos-passos.md): deploy Vercel, domínio, dados compartilhados e caminho para produção.
- [`docs/usar-script-kanban.md`](docs/usar-script-kanban.md): pré-requisitos, segurança e limitações da automação do GitHub Project.
- [`scripts/criar-kanban.ps1`](scripts/criar-kanban.ps1): script idempotente para criar ou atualizar o Kanban e vinculá-lo a `TauanelSilva/ChegoLa`.

No Windows com PowerShell 7 e GitHub CLI autenticado como `TauanelSilva`:

```powershell
pwsh -File .\scripts\criar-kanban.ps1
```
