---
cursor:
  subagentId: "bc-82a203d6-1e09-5d0b-b09c-093faa84bcde"
---

# Chegolá? — roteiro prático para as próximas duas semanas

Este documento transforma o escopo do **Chegolá?** em um começo viável para uma estudante iniciante. O objetivo das duas primeiras semanas não é terminar o sistema. É entregar uma demonstração navegável, responsiva e fácil de explicar, validar decisões importantes com a equipe e preparar o caminho para banco, mapa e rotas reais.

## 1. Prompt/script mestre para trabalhar com IA

Copie o texto abaixo no início de uma nova conversa com a IA. Depois dele, acrescente somente a tarefa do dia e, quando necessário, o conteúdo dos arquivos envolvidos.

```text
Você é minha assistente de desenvolvimento e mentora no projeto “Chegolá?”.

CONTEXTO
Sou estudante e desenvolvedora iniciante. Explique decisões com linguagem simples, divida tarefas grandes em passos pequenos e não suponha que eu conheça comandos, bibliotecas ou conceitos avançados. Antes de sugerir código, considere o que já existe no projeto. Se faltar uma decisão da equipe, sinalize claramente e proponha uma solução temporária com dados simulados.

OBJETIVO DO PRODUTO
Criar uma aplicação web responsiva, inicialmente para Itaúna/MG, que permita:
1. apresentar o projeto;
2. visualizar pontos de alagamento;
3. consultar ocorrências;
4. enviar uma ocorrência;
5. futuramente consultar rotas e receber alertas quando uma rota cruzar uma área de risco.

STACK OBRIGATÓRIA
- TypeScript;
- Next.js com App Router;
- Supabase para banco de dados e, se aprovado, armazenamento de mídia;
- MapLibre GL JS para renderização do mapa;
- GitHub Projects para organizar o trabalho.

ESCOPO DA PRIMEIRA ENTREGA DEMONSTRÁVEL
- navegação entre Início, Mapa, Ocorrências, Informar ocorrência e Sobre;
- layout responsivo para computador e celular;
- textos reais fornecidos pela equipe ou rótulos claros de “conteúdo provisório”;
- lista de ocorrências usando dados simulados locais;
- formulário visual com validação no navegador, sem gravar no banco;
- mapa inicialmente como área demonstrativa ou mapa básico, sem prometer rota segura;
- estados visuais simples: carregando, lista vazia, erro e sucesso;
- README com instruções para executar o projeto.

FORA DE ESCOPO NESTA PRIMEIRA ENTREGA
- autenticação e login;
- painel administrativo;
- integração automática com a Defesa Civil;
- moderação automatizada;
- aplicativo para lojas;
- notificações;
- cálculo real de “rota segura”;
- upload real de foto ou vídeo;
- publicação definitiva em produção.

REGRAS E RESTRIÇÕES
1. Não invente APIs, dados de alagamento, chaves, decisões da equipe ou garantias de segurança.
2. Nunca chame uma rota de “segura”. Use “rota calculada” e informe que dados de risco ainda precisam ser validados.
3. Não exponha chaves secretas no navegador, no código ou no repositório.
4. Não altere banco, mapa, rotas ou armazenamento antes de apresentar um plano e confirmar comigo as decisões pendentes.
5. Prefira a solução mais simples que cumpra a tarefa. Não adicione bibliotecas sem necessidade.
6. Use TypeScript de forma estrita; evite `any`.
7. Preserve acessibilidade básica: HTML semântico, labels, foco visível, contraste e uso por teclado.
8. Considere telas pequenas desde o início.
9. Não faça várias mudanças grandes de uma vez. Entregue uma etapa verificável por vez.
10. Para cada mudança, diga quais arquivos criar ou editar e forneça o conteúdo completo apenas quando isso for útil.
11. Depois de cada etapa, informe como executar e verificar o resultado, incluindo o que devo observar no navegador.
12. Se houver erro, primeiro explique a provável causa e peça ou indique a mensagem exata necessária; não sugira apagar tudo.

FORMATO DA SUA RESPOSTA
Responda nesta ordem:
1. Objetivo desta tarefa em uma frase.
2. Plano curto, com no máximo cinco passos.
3. Decisões ou dúvidas que me impedem de continuar, se existirem.
4. Implementação em partes pequenas.
5. Como testar.
6. Resultado esperado.
7. Próximo passo recomendado, sem executá-lo automaticamente.

CRITÉRIO DE CONCLUSÃO
Uma tarefa só está concluída quando:
- o projeto inicia sem erro;
- a tela funciona em computador e celular;
- não há erro evidente no console;
- o comportamento pedido foi testado;
- a documentação necessária foi atualizada;
- eu consigo explicar o que foi feito.

TAREFA DE HOJE:
[Escreva aqui uma única tarefa, por exemplo: “Criar o cabeçalho responsivo seguindo as telas aprovadas”.]
```

### Como usar sem se perder

1. Abra um cartão do GitHub Projects e escolha **uma** tarefa.
2. Cole o prompt mestre e substitua `[TAREFA DE HOJE]` pelo título e pela descrição do cartão.
3. Faça apenas o primeiro passo sugerido e teste.
4. Se aparecer um erro, envie à IA a mensagem completa e diga qual comando ou ação o causou.
5. Antes de aceitar código, peça: “Explique em linguagem simples o que cada arquivo faz”.
6. Ao terminar, compare o resultado com os critérios de aceite do cartão.

## 2. Plano realista para duas semanas

Premissa: dez dias úteis, com uma sessão principal de trabalho por dia. Se um dia não for suficiente, mova o restante para o próximo; não esconda a pendência. A primeira demonstração acontece no fim da primeira semana com dados simulados. A segunda semana melhora a demonstração e prepara integrações futuras.

### Semana 1 — entregar algo navegável

| Dia útil | Foco | Atividades | Resultado verificável |
|---|---|---|---|
| **1 — Preparar e entender** | Base do projeto | Confirmar as cinco páginas; revisar referências visuais; criar o projeto Next.js com TypeScript; configurar formatação; escrever README inicial; criar cartões no GitHub Projects. | Projeto abre localmente e o quadro contém o trabalho inicial. |
| **2 — Criar a estrutura visual** | Layout compartilhado | Criar cabeçalho, navegação, rodapé, cores, tipografia e largura de conteúdo; garantir menu utilizável no celular. | Todas as páginas vazias são acessíveis pela navegação em desktop e celular. |
| **3 — Montar páginas de conteúdo** | Início e Sobre | Implementar as duas páginas com conteúdo disponível; marcar textos ou imagens ainda provisórios; revisar semântica e contraste. | Início e Sobre podem ser demonstradas sem links quebrados. |
| **4 — Simular ocorrências** | Lista e estados | Definir o tipo TypeScript de ocorrência; criar dados locais fictícios claramente identificados; montar cartões e estados de carregamento, vazio e erro. | A página Ocorrências apresenta dados simulados e seus principais estados. |
| **5 — Fechar a primeira demonstração** | Formulário e revisão | Montar o formulário com local, data, horário, descrição e campo visual de mídia; validar campos sem enviar ao banco; revisar responsividade e o fluxo completo. | Demonstração navegável das cinco páginas, sem banco ou rotas reais, apresentada à equipe para comentários. |

**Marco da semana 1:** a equipe consegue abrir ou assistir à demonstração, navegar pelos cinco fluxos e confirmar se a estrutura visual está no caminho certo. Deve ficar explícito que ocorrências, envio, mapa e rota ainda são simulações.

### Semana 2 — validar escolhas e reduzir riscos

| Dia útil | Foco | Atividades | Resultado verificável |
|---|---|---|---|
| **6 — Consolidar feedback** | Ajustes controlados | Reunir o retorno da demonstração em uma lista única; corrigir defeitos pequenos; separar mudanças novas para o Backlog; registrar respostas às decisões críticas. | Feedback classificado e primeira entrega estabilizada, sem aumento silencioso de escopo. |
| **7 — Preparar o mapa** | Prova técnica pequena | Confirmar fonte dos blocos do mapa e atribuição; adicionar MapLibre somente se essas escolhas estiverem aprovadas; exibir Itaúna e um marcador fictício identificado como demonstração. | Mapa básico renderiza ou, se a decisão estiver pendente, existe uma tela substituta clara e o bloqueio está registrado. |
| **8 — Desenhar o banco antes de criar** | Modelo de dados | Confirmar moderação, privacidade e retenção; desenhar tabelas e campos de ocorrências; separar dados públicos de dados sensíveis; revisar o modelo sem criar produção. | Modelo de dados documentado e aprovado ou dúvidas registradas, sem banco improvisado. |
| **9 — Planejar integração** | Supabase e rotas | Definir ambientes e variáveis; listar políticas de acesso necessárias; comparar opções de geocodificação e rotas, limites e custos; não integrar enquanto decisões críticas faltarem. | Checklist técnico para Supabase, mapa e rotas, com responsáveis e pendências. |
| **10 — Demonstrar e planejar próxima etapa** | Encerramento do ciclo | Fazer teste manual em desktop e celular; corrigir defeitos que impeçam a demonstração; atualizar README e quadro; apresentar o que funciona, o que é simulado e o que está bloqueado. | Segunda demonstração estável e Backlog priorizado para a etapa seguinte. |

**O que não prometer ao fim da semana 2:** sistema completo, rota que evita alagamentos, dados oficiais atualizados, envio público em produção, upload de mídia ou moderação. Essas funções dependem das confirmações listadas na seção 5.

## 3. Cartões para copiar ao GitHub Projects

Estimativas representam esforço relativo para uma iniciante, não prazo garantido:

- **P:** até uma sessão curta;
- **M:** uma sessão de trabalho;
- **G:** duas ou mais sessões e possível pesquisa.

Crie os cartões abaixo e coloque-os inicialmente na coluna indicada. Ao começar, mova somente um cartão por vez para **In progress**.

### Ready

#### Cartão 1 — Preparar projeto Next.js e documentação inicial

- **Descrição curta:** Criar a base em Next.js com TypeScript e registrar como executar o projeto.
- **Critérios de aceite:**
  - projeto inicia localmente sem erro;
  - TypeScript está configurado;
  - README explica instalação e execução;
  - não há chave secreta versionada.
- **Prioridade:** Alta
- **Estimativa:** M
- **Coluna inicial:** Ready

#### Cartão 2 — Criar layout e navegação responsivos

- **Descrição curta:** Implementar cabeçalho, navegação, rodapé e estrutura visual comum às páginas.
- **Critérios de aceite:**
  - existem links para Início, Mapa, Ocorrências, Informar ocorrência e Sobre;
  - a navegação funciona por teclado;
  - não há rolagem horizontal indevida em tela pequena;
  - a página atual é identificável.
- **Prioridade:** Alta
- **Estimativa:** G
- **Coluna inicial:** Ready

#### Cartão 3 — Implementar páginas Início e Sobre

- **Descrição curta:** Construir as páginas de conteúdo a partir do material aprovado.
- **Critérios de aceite:**
  - páginas seguem a referência visual disponível;
  - conteúdo provisório está identificado;
  - imagens possuem texto alternativo adequado;
  - visual funciona em desktop e celular.
- **Prioridade:** Alta
- **Estimativa:** G
- **Coluna inicial:** Ready

#### Cartão 4 — Exibir ocorrências simuladas e estados da lista

- **Descrição curta:** Criar cartões de ocorrência usando dados locais fictícios e tipados.
- **Critérios de aceite:**
  - existe um tipo TypeScript para ocorrência;
  - dados fictícios estão marcados como demonstração;
  - lista mostra local, região e nível de risco;
  - estados carregando, vazio e erro podem ser verificados.
- **Prioridade:** Alta
- **Estimativa:** G
- **Coluna inicial:** Ready

#### Cartão 5 — Montar formulário demonstrativo de ocorrência

- **Descrição curta:** Criar o formulário com validação local, ainda sem Supabase nem upload real.
- **Critérios de aceite:**
  - contém local, data, horário, descrição e campo visual para mídia;
  - descrição respeita o limite de 500 caracteres;
  - campos obrigatórios exibem mensagens claras;
  - o envio simulado mostra sucesso sem alegar gravação real.
- **Prioridade:** Alta
- **Estimativa:** G
- **Coluna inicial:** Ready

#### Cartão 6 — Revisar a primeira demonstração

- **Descrição curta:** Verificar os cinco fluxos antes de apresentar à equipe.
- **Critérios de aceite:**
  - todas as páginas abrem pela navegação;
  - não há erro evidente no console;
  - teste manual foi feito em desktop e celular;
  - funções simuladas estão identificadas;
  - pendências encontradas viraram cartões.
- **Prioridade:** Alta
- **Estimativa:** M
- **Coluna inicial:** Ready

### Backlog

#### Cartão 7 — Consolidar feedback da primeira demonstração

- **Descrição curta:** Organizar o retorno da equipe sem misturar defeitos e novas ideias.
- **Critérios de aceite:**
  - feedback foi reunido em uma lista única;
  - cada item está classificado como defeito, ajuste aprovado ou novo escopo;
  - itens aceitos possuem prioridade;
  - novas funções permanecem no Backlog até aprovação.
- **Prioridade:** Alta
- **Estimativa:** M
- **Coluna inicial:** Backlog

#### Cartão 8 — Confirmar decisões críticas de dados e moderação

- **Descrição curta:** Obter respostas antes de criar banco, upload ou publicação de ocorrências.
- **Critérios de aceite:**
  - fonte e responsável pelos dados de alagamento estão registrados;
  - regra de aprovação de ocorrências está definida;
  - retenção de mídia e limite de arquivo estão definidos;
  - responsável por termos e privacidade está identificado.
- **Prioridade:** Alta
- **Estimativa:** M
- **Coluna inicial:** Backlog

#### Cartão 9 — Fazer prova técnica do mapa com MapLibre

- **Descrição curta:** Renderizar um mapa básico de Itaúna após confirmar fonte dos blocos e atribuição.
- **Critérios de aceite:**
  - fonte do mapa, licença, atribuição e limites de uso estão documentados;
  - mapa centraliza em Itaúna;
  - pelo menos um marcador fictício está identificado como demonstração;
  - existe estado de erro quando o mapa não carrega;
  - nenhuma rota é chamada de segura.
- **Prioridade:** Média
- **Estimativa:** G
- **Coluna inicial:** Backlog

#### Cartão 10 — Desenhar modelo de dados de ocorrências

- **Descrição curta:** Planejar tabelas, campos e visibilidade antes de configurar o Supabase.
- **Critérios de aceite:**
  - campos obrigatórios e opcionais estão documentados;
  - status de moderação foi previsto;
  - dados públicos e sensíveis estão separados;
  - datas, localização e referências de mídia têm tipos definidos;
  - modelo foi revisado antes de criar tabelas.
- **Prioridade:** Alta
- **Estimativa:** M
- **Coluna inicial:** Backlog

#### Cartão 11 — Planejar segurança e ambientes do Supabase

- **Descrição curta:** Definir como o aplicativo acessará banco e armazenamento sem expor segredos.
- **Critérios de aceite:**
  - variáveis públicas e secretas estão diferenciadas;
  - ambientes de desenvolvimento e produção estão planejados;
  - políticas de acesso necessárias estão listadas;
  - chaves administrativas não serão usadas no navegador;
  - tratamento de spam foi discutido.
- **Prioridade:** Alta
- **Estimativa:** M
- **Coluna inicial:** Backlog

#### Cartão 12 — Avaliar provedores de geocodificação e rotas

- **Descrição curta:** Comparar alternativas antes de implementar busca de endereços ou cálculo de rota.
- **Critérios de aceite:**
  - pelo menos duas opções foram comparadas;
  - custos, limites, licença e cobertura de Itaúna estão registrados;
  - responsável pela conta e cobrança está definido;
  - está decidido se a rota apenas alerta ou tenta evitar áreas de risco;
  - limitações serão comunicadas na interface.
- **Prioridade:** Alta
- **Estimativa:** G
- **Coluna inicial:** Backlog

#### Cartão 13 — Definir política de mídia e privacidade

- **Descrição curta:** Decidir regras para fotos, vídeos, localização e dados enviados pelo público.
- **Critérios de aceite:**
  - formatos, tamanho máximo e tempo de retenção estão definidos;
  - consentimento necessário está documentado;
  - responsável por remoção e atendimento está definido;
  - conteúdo proibido e regra de moderação estão registrados.
- **Prioridade:** Alta
- **Estimativa:** M
- **Coluna inicial:** Backlog

#### Cartão 14 — Preparar checklist da segunda demonstração

- **Descrição curta:** Registrar o que funciona, o que é simulado e quais decisões continuam pendentes.
- **Critérios de aceite:**
  - fluxo principal foi testado em desktop e celular;
  - README está atualizado;
  - defeitos bloqueadores foram corrigidos ou documentados;
  - demonstração não apresenta funções futuras como prontas;
  - próximos cartões estão priorizados.
- **Prioridade:** Média
- **Estimativa:** M
- **Coluna inicial:** Backlog

## 4. Como usar as colunas do quadro

### Backlog

Guarda ideias, tarefas futuras e itens ainda bloqueados ou não detalhados. Um cartão no Backlog **não está prometido para esta semana**. Revise essa coluna no início de cada ciclo e evite começar algo só porque parece interessante.

### Ready

Contém tarefas entendidas, pequenas o suficiente para começar e sem decisão crítica pendente. O cartão deve ter critérios de aceite. Mova do Backlog para Ready somente depois de confirmar que há informação suficiente.

### In progress

É o que está sendo desenvolvido agora. Para uma iniciante, mantenha **apenas um cartão** nessa coluna. Ao encontrar um bloqueio, registre-o no cartão; se não puder avançar, devolva o cartão ao Backlog ou Ready com uma nota e escolha outro.

### In review

O desenvolvimento terminou, mas ainda precisa de verificação. Compare com todos os critérios de aceite, teste em desktop e celular e, quando necessário, peça revisão da equipe. Correções encontradas continuam no mesmo cartão se fizerem parte do aceite.

### Done

Use apenas quando todos os critérios de aceite foram cumpridos e o resultado foi testado. “Quase pronto”, “funciona só no meu computador” ou “falta revisar” não é Done. Registre uma nota curta com o que foi verificado.

**Fluxo normal:** `Backlog → Ready → In progress → In review → Done`.

## 5. Riscos e decisões a confirmar antes das integrações

### Antes do mapa

| Decisão ou risco | O que precisa ser confirmado | Por que importa |
|---|---|---|
| Fonte do mapa-base | Qual serviço fornecerá os blocos, qual licença, atribuição, limite e eventual custo? | MapLibre desenha o mapa, mas não fornece sozinho os blocos nem garante uso gratuito. |
| Área atendida | O lançamento ficará somente em Itaúna? Quais bairros ou limites geográficos? | Define enquadramento do mapa, validação de endereços e volume de dados. |
| Fonte dos riscos | Quem fornece, valida e atualiza pontos ou áreas de alagamento? Há planilha ou API? | Sem fonte confiável, marcadores podem ser apenas demonstrativos. |
| Formato do risco | Risco será um ponto, trecho de via ou área? Terá nível e validade? | O formato muda o banco, a visualização e a análise de rota. |
| Localização do usuário | O aplicativo realmente precisa solicitar geolocalização? | Exige consentimento, tratamento de erro e explicação de privacidade. |

### Antes das rotas e da geocodificação

| Decisão ou risco | O que precisa ser confirmado | Por que importa |
|---|---|---|
| Comportamento da rota | Deve apenas alertar ao cruzar um risco ou tentar evitá-lo? | “Evitar” exige geometria e integração mais complexas e não garante segurança. |
| Provedor | Qual API será usada para endereços e rotas? Quem cria e paga a conta? | Há limites, termos, cobertura e custos diferentes. |
| Critério de cruzamento | Qual distância ou interseção caracteriza que uma rota passa por risco? | Sem regra, os alertas podem ser inconsistentes. |
| Atualidade dos dados | Qual é a frequência de atualização e como mostrar dados vencidos? | Uma rota pode parecer aceitável com informação antiga. |
| Responsabilidade e texto | Qual aviso jurídico e operacional aparecerá ao usuário? | O sistema não pode prometer uma “rota segura” nem substituir orientações oficiais. |
| Falhas externas | O que mostrar quando geocodificação ou rotas estiverem indisponíveis? | O fluxo precisa falhar com clareza, sem inventar um resultado. |

### Antes do Supabase, formulário e mídia

| Decisão ou risco | O que precisa ser confirmado | Por que importa |
|---|---|---|
| Publicação e moderação | Ocorrências aparecem imediatamente ou após aprovação? Quem aprova e por qual processo? | Sem painel administrativo, aprovação manual precisa de alternativa realista. |
| Dados coletados | Haverá nome, contato, localização exata ou outro dado pessoal? | Coletar menos dados reduz risco e muda permissões e política de privacidade. |
| Banco público | Quais campos podem ser lidos pelo navegador e quais ficam restritos? | Políticas mal configuradas podem expor ou permitir alteração de dados. |
| Spam e abuso | Haverá limite de envio, CAPTCHA ou outra proteção? | Formulário público pode gerar custos e conteúdo impróprio. |
| Mídia | Foto, vídeo ou ambos? Quais formatos, tamanho e retenção? | O limite visual de 50 MB pode aumentar custo, lentidão e risco de abuso. |
| Consentimento | Quem fornecerá termos de uso, política de privacidade e autorização de mídia? | O desenvolvimento técnico não substitui validação jurídica. |
| Exclusão | Quem remove conteúdo e atende pedidos? Haverá prazo? | Dados públicos e mídia precisam de processo de correção e remoção. |
| Ambientes e segredos | Haverá projetos separados para desenvolvimento e produção? Quem guarda acessos? | Evita testes em dados reais e exposição de credenciais. |
| Backup e retenção | Por quanto tempo dados ficam guardados e como serão recuperados? | Afeta custo, privacidade e continuidade. |

### Decisões mínimas para liberar cada etapa

- **Mapa básico:** fonte dos blocos, licença/atribuição, área atendida e fonte inicial dos riscos.
- **Rotas:** todas as decisões do mapa, provedor de rota/geocodificação, regra de alerta ou desvio e texto de limitação.
- **Banco/formulário:** moderação, campos coletados, visibilidade, políticas de acesso, spam, privacidade e responsável operacional.
- **Upload:** formatos, tamanho, retenção, consentimento, moderação e custos.

Enquanto uma decisão mínima estiver pendente, use dados simulados claramente identificados. Isso permite aprender e demonstrar a interface sem criar uma integração que depois precise ser refeita ou que passe uma falsa sensação de segurança.
