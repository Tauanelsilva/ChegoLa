# Próximos passos — Chegolá?

## O que a versão atual realmente faz

- **Mapa sob demanda:** o navegador carrega tiles raster do OpenStreetMap quando a página é aberta. Se eles falharem, o aplicativo tenta uma base CARTO com dados OpenStreetMap e mostra o ocorrido.
- **Endereços sob demanda:** um Route Handler do Next.js consulta Nominatim/OpenStreetMap somente quando a pessoa calcula uma rota ou envia um endereço. O servidor prioriza Itaúna, tenta variações, limita a frequência e mantém cache.
- **Rotas sob demanda:** o servidor público do OSRM é consultado somente após clicar em **Calcular rota**.
- **Ocorrências iniciais:** são dados demonstrativos empacotados no código; não são informações oficiais nem atualizadas automaticamente.
- **Novos relatos:** ficam apenas no `localStorage` do navegador usado. Não aparecem para outras pessoas ou dispositivos e podem desaparecer quando os dados do navegador forem limpos.

Nada nesta versão é monitoramento de alagamentos em tempo real. MapLibre, OpenStreetMap/CARTO, Nominatim e OSRM exibem mapa, localizam endereços e calculam trajetos, mas não fornecem uma fonte validada de alagamentos.

## Prioridade 0 — publicar a demonstração com segurança

1. Colocar o código no repositório definitivo e confirmar que `npm ci`, `npm run lint` e `npm run build` passam.
2. Importar o repositório na Vercel.
3. Configurar corretamente **Root Directory**:
   - se `package.json` está na raiz do repositório, usar `.` (padrão), mesmo que o clone local esteja em uma pasta Windows chamada `ChegoLa`;
   - usar `ChegoLa` somente se o próprio repositório tiver uma subpasta `ChegoLa/package.json`.
4. Manter **Framework Preset: Next.js**, **Install Command: `npm ci`** e **Build Command: `npm run build`**.
5. Conferir no deploy `/maplibre-gl-worker.mjs` e `/maplibre-gl-shared.mjs`. O projeto sincroniza esses arquivos no `postinstall` e no `prebuild`.
6. Testar mapa, marcadores, rota, formulário e viewport móvel na URL de produção.

### URL e custos da Vercel

Cada projeto recebe uma URL própria no formato `nome-do-projeto.vercel.app`. O plano Hobby costuma ser suficiente para uma demonstração acadêmica dentro dos limites vigentes. Ele não torna Nominatim, OSRM ou tiles serviços de produção.

Planos, limites e preços da Vercel podem mudar. Consulte a página oficial antes de prometer custo zero ou capacidade. Projetos comerciais, maior volume, equipe, observabilidade e recursos avançados podem exigir plano pago.

### Domínio próprio

Um domínio próprio é opcional. Ele é comprado separadamente em um registrador e possui renovação periódica. Depois da compra:

1. adicionar o domínio em **Vercel → Project → Settings → Domains**;
2. aplicar os registros DNS indicados pela Vercel;
3. aguardar a propagação;
4. confirmar HTTPS, que normalmente é provisionado automaticamente pela Vercel.

O custo do domínio não está incluído no plano gratuito da aplicação.

## Prioridade 1 — dados compartilhados com Supabase

Supabase seria necessário para compartilhar relatos entre navegadores, mas não transforma os dados em oficiais nem cria monitoramento por si só.

Antes de integrar:

1. aprovar modelo de dados, níveis de risco, data de validade e coordenadas;
2. definir moderação: relatos entram pendentes ou públicos?;
3. criar tabelas e políticas RLS com o menor acesso possível;
4. enviar formulários por uma rota de servidor com validação, limite de frequência e proteção contra abuso;
5. definir privacidade, retenção, correção e exclusão;
6. decidir se mídia será aceita e como será moderada;
7. separar desenvolvimento e produção;
8. adicionar estados de sincronização e conflito.

O Supabase Realtime pode avisar clientes sobre registros criados ou atualizados no banco. Isso é **atualização em tempo real do banco**, não detecção em tempo real de chuva ou alagamento.

## Prioridade 2 — fonte validada de alagamentos

Para afirmar que um ponto está atualizado, o projeto precisa de uma fonte responsável:

- Defesa Civil, prefeitura ou outra instituição identificada;
- API, planilha ou processo operacional documentado;
- frequência de atualização;
- horário da última verificação;
- validade e expiração do alerta;
- área, ponto ou trecho afetado;
- responsável por corrigir e retirar informação.

Sem isso, a interface deve continuar usando “relato não verificado” e nunca “rota segura”.

## Prioridade 3 — serviços de mapa e rota para produção

As instâncias públicas atuais são adequadas apenas para demonstração de baixo volume:

- respeitar política, atribuição e limites do OpenStreetMap e da base alternativa CARTO;
- respeitar a política pública do Nominatim, sem autocomplete intenso e com baixa frequência;
- não depender do servidor demonstrativo do OSRM para disponibilidade comercial;
- comparar provedores com SLA, limites, cobertura e custos, ou hospedar infraestrutura própria;
- manter fallback e mensagens de erro, sem fabricar localização ou rota;
- configurar monitoramento de falhas e orçamento antes de aumentar o tráfego.

## Prioridade 4 — qualidade e operação

- testes automatizados de persistência, filtros, geocodificação e cálculo de proximidade;
- teste de deploy Vercel em Chrome, Edge e navegador móvel;
- acessibilidade com teclado, leitor de tela, contraste e zoom;
- política de backup e recuperação;
- logs sem dados pessoais;
- canal para correção de relatos;
- revisão jurídica de termos e privacidade;
- painel ou fluxo de moderação antes de divulgação pública.
