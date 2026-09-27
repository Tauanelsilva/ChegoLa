---
cursor:
  subagentId: "bc-88c3b265-6282-5834-8a0f-69d9d4623369"
---

# Plano de escopo e orçamento — “Chegolá?”

## Conclusão da análise dos anexos

Os anexos confirmam que o trabalho **não é um site institucional simples**. Trata-se de um aplicativo web responsivo para Itaúna/MG, chamado “Chegolá?”, voltado ao mapeamento colaborativo de pontos de alagamento e à consulta de rotas mais seguras.

O áudio, com cerca de 1 minuto, informa que o layout foi alterado conforme combinado, que a equipe pode iniciar com o material já disponível e que não são esperadas novas mudanças relevantes neste momento. Dúvidas pontuais podem ser enviadas ao grupo; uma conversa com Otto só seria possível na semana seguinte. Portanto, as sete telas entregues devem ser tratadas como **referência visual aprovada para iniciar**, e não como ideias genéricas.

As telas validam cinco fluxos: página inicial, mapa interativo com cálculo de rota, listagem de ocorrências, envio de ocorrência e página “Sobre o Projeto”. Elas apresentam versão desktop; a adaptação para celular faz parte do desenvolvimento.

## Premissas técnicas para o orçamento

- Aplicação web responsiva, inicialmente restrita a Itaúna/MG.
- Identidade visual, textos-base e organização das telas fornecidos pela equipe.
- Mapa baseado em OpenStreetMap/MapLibre ou serviço equivalente.
- Geocodificação e cálculo de rotas por API externa; limites e custos do provedor são responsabilidade da contratante.
- Banco de dados para ocorrências e armazenamento de fotos/vídeos.
- Envio público de ocorrência, sem login, até decisão contrária.
- Dados de risco apresentados no mapa e nas rotas precisam ser cadastrados ou fornecidos pela equipe; **não está incluída integração automática com a Defesa Civil**.
- Publicação em um único ambiente de produção.
- Não estão incluídos aplicativo nativo, loja, pagamentos, notificações, operação 24 horas, criação de marca nem produção completa de conteúdo.

## Escopo funcional validado

1. **Página inicial**
   - Cabeçalho com logotipo e navegação para Início, Mapa Interativo, Ocorrências e Sobre o Projeto.
   - Botão de destaque “Informar Ocorrência”.
   - Banner de Itaúna/MG e mapa-resumo com pontos de risco.

2. **Mapa interativo e rotas**
   - Campos de origem e destino, inversão dos pontos e botão “Calcular rota”.
   - Exibição da rota recomendada e de alternativa com risco de alagamento.
   - Marcadores de atenção, legenda, alternância entre mapa e satélite e controles de zoom/localização.
   - O cálculo evita ou sinaliza áreas de risco conforme os dados cadastrados e a capacidade da API escolhida.

3. **Ocorrências**
   - Lista em cartões com local, região e classificação de risco.
   - Acesso ao detalhe/localização da ocorrência.
   - Aviso sobre a origem e a atualização dos dados.

4. **Informar ocorrência**
   - Local, data, horário e descrição de até 500 caracteres.
   - Inclusão opcional de foto ou vídeo, com limite mostrado na interface de 50 MB.
   - Validação, envio, mensagem de sucesso/erro e gravação no banco.
   - Medidas básicas contra spam e arquivos inválidos.

5. **Sobre o projeto**
   - Contexto da pesquisa, origem da ideia, benefício esperado e objetivo.
   - Imagem institucional e campo de pesquisa do conteúdo, caso a equipe confirme sua necessidade.

## Entregáveis

- Aplicação web responsiva com os cinco fluxos descritos acima.
- Integração com mapa, geocodificação, rotas, banco de dados e armazenamento de mídia.
- Estados de carregamento, vazio, sucesso e erro nas operações principais.
- Validação do formulário e proteção básica contra spam.
- Metadados essenciais, ícone, título, descrição e imagem de compartilhamento.
- Ajustes básicos de acessibilidade e desempenho.
- Testes em versões atuais de Chrome, Edge e navegador móvel.
- Código-fonte organizado em repositório da equipe.
- Aplicação publicada e guia curto de acessos, serviços externos e manutenção.
- **1 rodada de revisão no valor mínimo** ou **2 rodadas no valor recomendado**, sem mudança de escopo.

Uma rodada é uma lista única e consolidada de ajustes enviada pela equipe. Correção de defeito em algo contratado não consome rodada. Mudança de regra, nova tela, novo fluxo ou alteração aprovada anteriormente é serviço adicional.

Não estão incluídos: domínio, hospedagem, consumo pago de APIs, painel administrativo próprio, autenticação, moderação automatizada, integração oficial com Defesa Civil, migração de dados, redação integral, manutenção contínua, monitoramento ou suporte após o período de garantia.

## Ordem de execução

1. Responder às dúvidas críticas e fechar escopo, preço e responsabilidades por escrito.
2. Receber a entrada, conteúdos finais e acessos aos serviços escolhidos.
3. Definir arquitetura, banco de dados, provedor de mapa/rotas e política de ocorrências.
4. Construir a base responsiva e os componentes visuais.
5. Implementar Início, Sobre o Projeto e listagem de ocorrências.
6. Implementar banco, envio de ocorrência e upload de mídia.
7. Integrar mapa, geocodificação, pontos de risco e cálculo de rotas.
8. Testar segurança básica, responsividade, acessibilidade e principais erros.
9. Aplicar a(s) rodada(s) de revisão contratada(s).
10. Receber a parcela final, publicar e entregar acessos e documentação.

A integração de rotas deve ser feita depois da definição dos dados de risco: sem uma fonte confiável desses pontos, o sistema pode desenhar rotas, mas não pode prometer que elas são seguras.

## Dúvidas críticas a resolver

1. Quem fornece e atualiza os pontos de alagamento: equipe, Defesa Civil ou outra fonte? Existe planilha/API inicial?
2. Ocorrências enviadas pelo público aparecem imediatamente ou precisam de aprovação? Quem fará essa aprovação se não houver painel administrativo?
3. O ícone de usuário mostrado no cabeçalho representa login ou é apenas visual? Este orçamento considera **sem login**.
4. A rota deve realmente evitar vias de risco ou apenas alertar quando a rota calculada cruza um ponto/área perigosa?
5. Qual provedor de mapas e rotas será usado e quem assumirá eventuais cobranças por uso?
6. O limite de 50 MB por foto/vídeo será mantido? Por quanto tempo os arquivos devem ficar armazenados?
7. Haverá termo de uso, consentimento e política de privacidade para localização e mídia enviadas por usuários?
8. O sistema ficará limitado a Itaúna/MG? Quais bairros e dados precisam estar cadastrados no lançamento?
9. A busca exibida em “Sobre o Projeto” deve pesquisar o quê? Se não houver conteúdo adicional, recomenda-se removê-la.
10. Quem fornece textos, logotipo, imagens e versão móvel aprovada? Quem dá a aprovação final?
11. Já existem domínio, hospedagem e contas dos serviços externos?
12. Há data fixa de apresentação ou lançamento?

## Cronograma realista

Estimativa para uma estudante iniciante: **20 a 30 dias úteis de trabalho**, contados após a entrada, o fechamento das dúvidas e o recebimento dos conteúdos e acessos.

| Etapa | Duração estimada |
|---|---:|
| Fechamento técnico e preparação | 2–3 dias úteis |
| Base responsiva e páginas de conteúdo | 4–5 dias úteis |
| Banco, ocorrências e upload | 4–6 dias úteis |
| Mapa, geocodificação e rotas | 6–9 dias úteis |
| Testes, revisão e publicação | 4–7 dias úteis |

Como margem de calendário, recomenda-se prometer **5 a 7 semanas**, pois respostas da equipe, ajustes de API e correções de integração não são totalmente previsíveis. Atrasos na entrega de conteúdo ou acessos pausam o prazo. Mudanças de escopo exigem novo valor e cronograma.

## Precificação sugerida

### Faixa mínima sustentável

**R$ 3.500**

É o piso para um MVP funcional exatamente como descrito, usando serviços com plano gratuito ou de baixo custo, conteúdo pronto, sem login, sem painel administrativo, sem integração oficial com a Defesa Civil e com **1 rodada de revisão**. Equivale aproximadamente a 75–90 horas de trabalho a R$ 39–47 por hora. Abaixo desse valor, a alternativa responsável é reduzir funções, não apenas baixar o preço.

### Faixa recomendada

**R$ 5.000**

É a proposta mais realista para absorver aprendizado e riscos de integração sem trabalhar de graça. Considera cerca de 95–110 horas, **2 rodadas de revisão**, testes mais completos, publicação e pequena margem para ajustes nas APIs. O valor recomendado deve ser apresentado primeiro; R$ 3.500 é limite de negociação com condições mais rígidas.

### Quando recalcular

Cobrar à parte ou emitir novo orçamento se houver:

- novas páginas, telas ou fluxos além dos cinco descritos;
- criação extensa ou reescrita de conteúdo;
- identidade visual ou logotipo;
- animações complexas;
- painel administrativo, login ou níveis de permissão;
- integração automática com Defesa Civil ou outras bases externas;
- notificações, moderação automatizada ou aplicativo nativo;
- loja virtual, pagamentos ou agendamento;
- urgência;
- mais revisões que o pacote contratado;
- alteração da API ou da arquitetura depois de aprovada.

Hora adicional sugerida: **R$ 50**, sempre aprovada antes da execução. Domínio, hospedagem, armazenamento, serviços de terceiros e licenças são pagos diretamente pela contratante.

## Condições de pagamento

Modelo recomendado:

- **40% na contratação**, para reservar o projeto e iniciar;
- **30% após a demonstração dos fluxos de ocorrência e mapa**, antes da etapa final;
- **30% após homologação e antes da publicação/entrega dos acessos**.

No valor mínimo, usar **50% na entrada e 50% antes da publicação**.

Condições importantes:

- iniciar somente após entrada e aprovação escrita do escopo;
- definir vencimentos e forma de pagamento em proposta/contrato;
- registrar se o pacote inclui uma ou duas rodadas de revisão;
- considerar uma rodada como uma lista consolidada de pedidos;
- cobrar alterações extras somente após aprovação de valor e prazo;
- pausar o projeto se a cliente ficar mais de 7 dias corridos sem responder;
- manter a proposta válida por 10 dias;
- transferir/publicar a entrega final após a quitação;
- oferecer **15 dias corridos de garantia** após a publicação somente para correção de defeitos do escopo contratado; suporte, conteúdo e novas funções são cobrados à parte.

## Recomendação final para a estudante

Apresentar **R$ 5.000** como proposta-base e aceitar **R$ 3.500 apenas como piso**, com uma revisão e todos os limites registrados. O projeto envolve banco de dados, arquivos, mapas e rotas; tratá-lo como um site comum criaria um orçamento artificialmente baixo.

É possível iniciar a estrutura visual com o material atual, como orienta o áudio. Antes de implementar dados, ocorrências e rotas, porém, a equipe precisa responder às dúvidas críticas — especialmente fonte dos riscos, moderação e provedor de mapas — porque essas decisões alteram diretamente a arquitetura e a responsabilidade do sistema.
