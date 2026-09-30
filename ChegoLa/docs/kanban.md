# Kanban de três semanas — Chegolá?

Fluxo: `Backlog → Ready → In progress → In review → Done`. A ordem numérica define a prioridade. Limite recomendado: um cartão em **In progress**.

## Criar o quadro no GitHub

No Windows, siga [`usar-script-kanban.md`](usar-script-kanban.md) e execute:

```powershell
pwsh -File .\scripts\criar-kanban.ps1
```

O script cria ou reutiliza o GitHub Project pessoal, evita cartões duplicados e não apaga conteúdo existente. A posição deste arquivo registra o estado funcional atual; o script aplica o planejamento inicial das três semanas.

Decisões de deploy, limites dos serviços públicos e a evolução para dados compartilhados estão em [`proximos-passos.md`](proximos-passos.md).

## Done

### 01 — Base oficial e identidade visual
**Semana:** 1 · **Ordem:** 1  
**Aceite:** scaffold oficial Next.js; TypeScript, Tailwind e shadcn/ui configurados; logo vetorial responsiva com pin azul/laranja, nome e slogan aplicada; sem segredo.

### 02 — Navegação e páginas institucionais
**Semana:** 1 · **Ordem:** 2  
**Aceite:** links para Início, Mapa, Ocorrências, Informar e Sobre; menu móvel e teclado funcionam; página atual identificável; Início e Sobre possuem conteúdo realista.

### 03 — Mapa demonstrativo
**Semana:** 1 · **Ordem:** 3  
**Aceite:** MapLibre com mapa público e atribuição; ocorrências locais como marcadores; rota OSRM com geocodificação, carregamento e erro; alerta de proximidade sem promessa de rota segura.

### 04 — Pontos oficiais e relatos locais
**Semana:** 1 · **Ordem:** 4  
**Aceite:** cartões tipados diferenciam referência oficial histórica de relatos locais; fonte, data e precisão são visíveis; locais oficiais ambíguos ficam documentados e fora do mapa; busca, filtros e estados carregando, vazio e erro implementados.

### 05 — Formulário demonstrativo
**Semana:** 1 · **Ordem:** 5  
**Aceite:** local, região, risco, data, hora, descrição e mídia validados; endereço geocodificado; ocorrência salva no localStorage e exibida na lista e no mapa; mídia não armazenada.

### 06 — Documentação e verificação inicial
**Semana:** 1 · **Ordem:** 6  
**Aceite:** README, prompt mestre e Kanban atualizados; lint e build passam; execução local documentada.

### 14 — Definir mapa-base e licença
**Semana:** 3 · **Ordem:** 14
**Aceite:** MapLibre com tiles raster OpenStreetMap, atribuição e fallback CARTO/OSM; uso demonstrativo e dependência de serviços públicos documentados.

### 15 — Avaliar geocodificação e rotas
**Semana:** 3 · **Ordem:** 15
**Aceite:** Nominatim acessado por Route Handler sem lista hardcoded de ruas, com normalização, variantes genéricas, limite municipal, classificação exata/aproximada, cache e controle de frequência; coordenadas preservadas; OSRM usado sem chave e rota identificada explicitamente como não segura.

### 19 — Prova técnica das integrações aprovadas
**Semana:** 3 · **Ordem:** 19
**Aceite:** mapa, geocodificação e rota públicos integrados; falhas externas tratadas sem inventar resultados; nenhum segredo no cliente.

## In review

### 07 — Revisão visual com a equipe
**Semana:** 2 · **Ordem:** 7  
**Aceite:** comparar desktop e celular com as referências; registrar uma lista consolidada de divergências; classificar cada item como defeito, ajuste ou novo escopo.

## In progress

### 08 — Validação de conteúdo e linguagem
**Semana:** 2 · **Ordem:** 8  
**Aceite:** textos aprovados pela equipe; limitações aparecem nos cinco fluxos; nenhum texto sugere dado oficial, monitoramento em tempo real ou rota segura.

## Ready

### 09 — Auditoria de acessibilidade
**Semana:** 2 · **Ordem:** 9  
**Aceite:** navegação completa por teclado; foco visível; labels e mensagens associados; contraste revisado; zoom de 200% sem perda de função.

### 10 — Teste responsivo e navegadores
**Semana:** 2 · **Ordem:** 10  
**Aceite:** testar larguras 360, 768 e 1280 px; Chrome e Edge atuais; sem rolagem horizontal; defeitos bloqueadores corrigidos ou registrados.

### 11 — Definir dados e moderação
**Semana:** 2 · **Ordem:** 11  
**Aceite:** fonte e responsável pelos riscos; regra de aprovação; campos públicos e privados; frequência de atualização; processo de correção e remoção.

### 12 — Consolidar feedback da primeira demonstração
**Semana:** 2 · **Ordem:** 12
**Aceite:** feedback reunido em lista única; itens classificados e priorizados; novas funções mantidas no Backlog até aprovação.

### 13 — Preparar checklist da segunda demonstração
**Semana:** 2 · **Ordem:** 13
**Aceite:** fluxo principal testado em desktop e celular; funções simuladas e decisões pendentes explícitas; README e próximos cartões atualizados.

## Backlog

### 16 — Desenhar modelo de dados
**Semana:** 3 · **Ordem:** 16
**Aceite:** campos, tipos, status de moderação e retenção documentados; dados sensíveis separados; modelo revisado antes de criar infraestrutura.

### 17 — Definir mídia, privacidade e abuso
**Semana:** 3 · **Ordem:** 17
**Aceite:** formatos, tamanho, retenção, consentimento, conteúdo proibido, antispam e responsável operacional definidos.

### 18 — Planejar segurança e ambientes
**Semana:** 3 · **Ordem:** 18
**Aceite:** variáveis públicas e secretas diferenciadas; ambientes de desenvolvimento e produção planejados; políticas de acesso necessárias listadas.

### 20 — Checklist da terceira demonstração
**Semana:** 3 · **Ordem:** 20
**Aceite:** fluxos testados em desktop e celular; funções reais e simuladas listadas; decisões pendentes visíveis; Backlog repriorizado com a equipe.
