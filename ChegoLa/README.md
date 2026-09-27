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
- [`docs/usar-script-kanban.md`](docs/usar-script-kanban.md): pré-requisitos, segurança e limitações da automação do GitHub Project.
- [`scripts/criar-kanban.ps1`](scripts/criar-kanban.ps1): script idempotente para criar ou atualizar o Kanban.

No Windows com PowerShell 7 e GitHub CLI autenticado como `TauanelSilva`:

```powershell
pwsh -File .\scripts\criar-kanban.ps1
```
