# Como criar o Kanban no GitHub

O script [`scripts/criar-kanban.ps1`](../scripts/criar-kanban.ps1) cria ou reutiliza o projeto pessoal **Chegolá? — Desenvolvimento do MVP** na conta `TauanelSilva`, vincula esse Project ao repositório `TauanelSilva/ChegoLa`, adiciona 20 cartões sem repetir títulos e organiza:

- semana 1 em **Ready**;
- semanas 2 e 3 em **Backlog**.

Ele não apaga projetos, campos ou cartões existentes e nunca lê nem imprime o token.
Se o Project já estiver vinculado ao repositório, o vínculo é preservado e a execução continua normalmente.

## Pré-requisitos no Windows

1. Instale o [PowerShell 7](https://learn.microsoft.com/powershell/scripting/install/installing-powershell-on-windows).
2. Instale o [GitHub CLI oficial](https://cli.github.com/):

   ```powershell
   winget install --id GitHub.cli
   ```

3. Autentique a conta correta:

   ```powershell
   gh auth login --hostname github.com
   gh auth status --hostname github.com
   ```

   Se houver mais de uma conta autenticada:

   ```powershell
   gh auth switch --hostname github.com --user TauanelSilva
   ```

## Executar

Abra o PowerShell 7 na raiz do projeto:

```powershell
pwsh -File .\scripts\criar-kanban.ps1
```

Se o Windows tiver bloqueado o arquivo baixado, desbloqueie somente esse arquivo e execute novamente:

```powershell
Unblock-File .\scripts\criar-kanban.ps1
pwsh -File .\scripts\criar-kanban.ps1
```

Quando o escopo `project` estiver ausente, o próprio GitHub CLI solicitará autorização segura com:

```powershell
gh auth refresh --hostname github.com --scopes project
```

Nenhum token precisa ser copiado, colado ou colocado no script.

## Resultado esperado

Ao final, o terminal mostra a URL do Project. Executar novamente é seguro:

- o projeto é localizado pelo título exato;
- o Project aparece na aba **Projects** do repositório `TauanelSilva/ChegoLa`;
- cartões são localizados pelo título exato;
- somente cartões ausentes são criados;
- os cartões das semanas 1, 2 e 3 voltam aos estados planejados.

## Limitações

- Os cartões são itens de rascunho do Project v2; o script não cria 20 Issues no repositório.
- A conta `TauanelSilva` precisa ter permissão para ler `TauanelSilva/ChegoLa` e criar Projects pessoais.
- Se o campo padrão **Status** não tiver as cinco etapas, o script cria um campo separado chamado **Status MVP**, preservando o campo existente.
- Se já existir um campo **Status MVP** incompleto, o script para com uma mensagem clara; ele não remove nem reconfigura opções para evitar perda de dados.
- A detecção de duplicatas usa o título completo. Um cartão semelhante com outro título não é considerado duplicata.
- Mudanças futuras no formato JSON ou nos comandos de Projects do GitHub CLI podem exigir atualização do script.
