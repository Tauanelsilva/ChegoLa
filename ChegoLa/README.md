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
- O mapa usa o estilo público do OpenFreeMap, com dados e atribuição OpenStreetMap.
- Endereços usam a instância pública do Nominatim e rotas usam o servidor público de demonstração do OSRM.
- Os serviços públicos podem impor limites ou ficar indisponíveis; não são adequados para uma operação de produção sem contrato e infraestrutura próprios.

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

## Fluxos para verificar

- **Mapa:** calcule uma rota entre dois endereços de Itaúna ou coordenadas; confira traçado, distância, duração e alerta de ocorrências próximas.
- **Ocorrências:** busque por texto e filtre por risco ou origem; uma busca sem resultado exibe o estado vazio.
- **Formulário:** valide campos, salve um endereço localizável em Itaúna e confirme o novo relato na lista e no mapa.
- **Erro:** bloqueio ou corrupção do `localStorage` produz estado de erro recuperável; falhas de Nominatim, OSRM ou OpenFreeMap apresentam mensagens sem inventar resultados.

## Documentação

- [`docs/prompt-inicial.md`](docs/prompt-inicial.md): prompt mestre para sessões de desenvolvimento.
- [`docs/kanban.md`](docs/kanban.md): plano Kanban de três semanas com ordem e critérios de aceite.
- [`docs/usar-script-kanban.md`](docs/usar-script-kanban.md): pré-requisitos, segurança e limitações da automação do GitHub Project.
- [`scripts/criar-kanban.ps1`](scripts/criar-kanban.ps1): script idempotente para criar ou atualizar o Kanban e vinculá-lo a `TauanelSilva/ChegoLa`.

No Windows com PowerShell 7 e GitHub CLI autenticado como `TauanelSilva`:

```powershell
pwsh -File .\scripts\criar-kanban.ps1
```
