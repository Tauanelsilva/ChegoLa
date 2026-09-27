#requires -Version 7.0

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$Owner = "TauanelSilva"
$Repository = "ChegoLa"
$ProjectTitle = "Chegolá? — Desenvolvimento do MVP"
$RequiredStatuses = @("Backlog", "Ready", "In progress", "In review", "Done")

function Stop-WithMessage {
    param([Parameter(Mandatory)][string]$Message)
    Write-Error $Message
    exit 1
}

function Invoke-Gh {
    param([Parameter(Mandatory)][string[]]$GhArgs)

    $output = (& gh @GhArgs 2>&1 | Out-String).Trim()
    $exitCode = $LASTEXITCODE
    if ($exitCode -ne 0) {
        throw "gh $($GhArgs -join ' ') falhou (código $exitCode).`n$output"
    }
    return $output
}

function Get-ObjectProperty {
    param(
        [Parameter(Mandatory)]$InputObject,
        [Parameter(Mandatory)][string]$Name
    )

    $property = $InputObject.PSObject.Properties[$Name]
    if ($null -eq $property) {
        return $null
    }
    return $property.Value
}

function Get-ProjectByTitle {
    $json = Invoke-Gh -GhArgs @(
        "project", "list",
        "--owner", $Owner,
        "--limit", "100",
        "--format", "json"
    )
    $result = $json | ConvertFrom-Json
    return @($result.projects) |
        Where-Object { $_.title -ceq $ProjectTitle } |
        Select-Object -First 1
}

function Get-ProjectItems {
    param([Parameter(Mandatory)][int]$ProjectNumber)

    $json = Invoke-Gh -GhArgs @(
        "project", "item-list", "$ProjectNumber",
        "--owner", $Owner,
        "--limit", "500",
        "--format", "json"
    )
    return ($json | ConvertFrom-Json).items
}

function Get-LinkedRepositoryNames {
    param([Parameter(Mandatory)][string]$ProjectId)

    $query = @'
query($projectId: ID!) {
  node(id: $projectId) {
    ... on ProjectV2 {
      repositories(first: 100) {
        nodes {
          nameWithOwner
        }
      }
    }
  }
}
'@

    $json = Invoke-Gh -GhArgs @(
        "api", "graphql",
        "-f", "query=$query",
        "-F", "projectId=$ProjectId"
    )
    $result = $json | ConvertFrom-Json
    return @($result.data.node.repositories.nodes | ForEach-Object { $_.nameWithOwner })
}

function Get-ItemTitle {
    param([Parameter(Mandatory)]$Item)

    $title = Get-ObjectProperty -InputObject $Item -Name "title"
    if (-not [string]::IsNullOrWhiteSpace([string]$title)) {
        return [string]$title
    }

    $content = Get-ObjectProperty -InputObject $Item -Name "content"
    if ($null -ne $content) {
        $contentTitle = Get-ObjectProperty -InputObject $content -Name "title"
        if (-not [string]::IsNullOrWhiteSpace([string]$contentTitle)) {
            return [string]$contentTitle
        }
    }
    return ""
}

$Tasks = @(
    [pscustomobject]@{
        Order = 1; Week = 1; Title = "01 — Base oficial e identidade visual"
        Acceptance = @(
            "Scaffold oficial Next.js criado com TypeScript, Tailwind e shadcn/ui.",
            "Identidade visual responsiva implementada.",
            "Nenhum segredo ou serviço externo adicionado."
        )
    },
    [pscustomobject]@{
        Order = 2; Week = 1; Title = "02 — Navegação e páginas institucionais"
        Acceptance = @(
            "Links para Início, Mapa, Ocorrências, Informar e Sobre funcionam.",
            "Menu móvel e navegação por teclado funcionam.",
            "Início e Sobre possuem conteúdo realista."
        )
    },
    [pscustomobject]@{
        Order = 3; Week = 1; Title = "03 — Mapa demonstrativo"
        Acceptance = @(
            "Mapa visual de Itaúna inclui marcadores, legenda e controles.",
            "Origem e destino são validados e possuem estados de carregamento e erro.",
            "A interface não promete rota segura."
        )
    },
    [pscustomobject]@{
        Order = 4; Week = 1; Title = "04 — Ocorrências simuladas"
        Acceptance = @(
            "Cartões mostram local, região, risco e atualização.",
            "Dados fictícios são identificados claramente.",
            "Estados com dados, carregando, vazio e erro podem ser testados."
        )
    },
    [pscustomobject]@{
        Order = 5; Week = 1; Title = "05 — Formulário demonstrativo"
        Acceptance = @(
            "Local, data, hora, descrição e mídia estão disponíveis.",
            "Limites de 500 caracteres e 50 MB são validados.",
            "Envio simula sucesso e erro sem armazenar dados."
        )
    },
    [pscustomobject]@{
        Order = 6; Week = 1; Title = "06 — Documentação e verificação inicial"
        Acceptance = @(
            "README, prompt mestre e Kanban estão atualizados.",
            "Lint e build passam.",
            "Execução local está documentada."
        )
    },
    [pscustomobject]@{
        Order = 7; Week = 2; Title = "07 — Revisão visual com a equipe"
        Acceptance = @(
            "Desktop e celular foram comparados com as referências.",
            "Divergências foram reunidas em lista única.",
            "Itens foram classificados como defeito, ajuste ou novo escopo."
        )
    },
    [pscustomobject]@{
        Order = 8; Week = 2; Title = "08 — Validação de conteúdo e linguagem"
        Acceptance = @(
            "Textos foram aprovados pela equipe.",
            "Limitações aparecem nos cinco fluxos.",
            "Nenhum texto sugere dado oficial, tempo real ou rota segura."
        )
    },
    [pscustomobject]@{
        Order = 9; Week = 2; Title = "09 — Auditoria de acessibilidade"
        Acceptance = @(
            "Navegação completa por teclado e foco visível.",
            "Labels e mensagens estão associados aos campos.",
            "Contraste e zoom de 200% foram revisados."
        )
    },
    [pscustomobject]@{
        Order = 10; Week = 2; Title = "10 — Teste responsivo e navegadores"
        Acceptance = @(
            "Larguras 360, 768 e 1280 px foram testadas.",
            "Chrome e Edge atuais foram verificados.",
            "Não há rolagem horizontal nem defeito bloqueador sem registro."
        )
    },
    [pscustomobject]@{
        Order = 11; Week = 2; Title = "11 — Definir dados e moderação"
        Acceptance = @(
            "Fonte e responsável pelos riscos foram definidos.",
            "Regra de aprovação e visibilidade dos campos foi definida.",
            "Frequência de atualização e processo de remoção foram registrados."
        )
    },
    [pscustomobject]@{
        Order = 12; Week = 2; Title = "12 — Consolidar feedback da primeira demonstração"
        Acceptance = @(
            "Feedback está reunido em lista única.",
            "Cada item está classificado e priorizado.",
            "Novas funções permanecem no Backlog até aprovação."
        )
    },
    [pscustomobject]@{
        Order = 13; Week = 2; Title = "13 — Preparar checklist da segunda demonstração"
        Acceptance = @(
            "Fluxo principal foi testado em desktop e celular.",
            "Funções simuladas e decisões pendentes estão explícitas.",
            "README e próximos cartões estão atualizados."
        )
    },
    [pscustomobject]@{
        Order = 14; Week = 3; Title = "14 — Definir mapa-base e licença"
        Acceptance = @(
            "Provedor, licença, atribuição, limites e custos estão documentados.",
            "Cobertura de Itaúna foi confirmada.",
            "Responsável pela conta foi definido."
        )
    },
    [pscustomobject]@{
        Order = 15; Week = 3; Title = "15 — Avaliar geocodificação e rotas"
        Acceptance = @(
            "Ao menos duas opções foram comparadas.",
            "Custos, limites e cobertura foram registrados.",
            "Regra de alerta ou desvio e texto de limitação foram aprovados."
        )
    },
    [pscustomobject]@{
        Order = 16; Week = 3; Title = "16 — Desenhar modelo de dados"
        Acceptance = @(
            "Campos, tipos, moderação e retenção estão documentados.",
            "Dados públicos e sensíveis estão separados.",
            "Modelo foi revisado antes de criar infraestrutura."
        )
    },
    [pscustomobject]@{
        Order = 17; Week = 3; Title = "17 — Definir mídia, privacidade e abuso"
        Acceptance = @(
            "Formatos, tamanho e retenção foram definidos.",
            "Consentimento, conteúdo proibido e antispam foram registrados.",
            "Responsável operacional foi definido."
        )
    },
    [pscustomobject]@{
        Order = 18; Week = 3; Title = "18 — Planejar segurança e ambientes"
        Acceptance = @(
            "Variáveis públicas e secretas estão diferenciadas.",
            "Ambientes de desenvolvimento e produção estão planejados.",
            "Políticas de acesso necessárias estão listadas."
        )
    },
    [pscustomobject]@{
        Order = 19; Week = 3; Title = "19 — Prova técnica das integrações aprovadas"
        Acceptance = @(
            "Somente decisões aprovadas foram integradas.",
            "Falhas externas são tratadas sem inventar resultados.",
            "Nenhum segredo está no cliente e a documentação foi atualizada."
        )
    },
    [pscustomobject]@{
        Order = 20; Week = 3; Title = "20 — Checklist da terceira demonstração"
        Acceptance = @(
            "Fluxos foram testados em desktop e celular.",
            "Funções reais, simuladas e pendentes estão listadas.",
            "Backlog foi repriorizado com a equipe."
        )
    }
)

try {
    if ($null -eq (Get-Command "gh" -ErrorAction SilentlyContinue)) {
        Stop-WithMessage "GitHub CLI (gh) não foi encontrado. Instale-o em https://cli.github.com/ e execute novamente."
    }

    Write-Host "Validando autenticação no GitHub..." -ForegroundColor Cyan
    & gh auth status --hostname "github.com"
    if ($LASTEXITCODE -ne 0) {
        Stop-WithMessage "O GitHub CLI não está autenticado. Execute 'gh auth login --hostname github.com' e tente novamente."
    }

    $authenticatedLogin = Invoke-Gh -GhArgs @("api", "user", "--jq", ".login")
    if ($authenticatedLogin -ine $Owner) {
        Stop-WithMessage "A conta autenticada é '$authenticatedLogin', mas este script exige a conta '$Owner'. Use 'gh auth switch --hostname github.com --user $Owner'."
    }

    $repoName = Invoke-Gh -GhArgs @(
        "repo", "view", "$Owner/$Repository",
        "--json", "nameWithOwner",
        "--jq", ".nameWithOwner"
    )
    if ($repoName -ine "$Owner/$Repository") {
        Stop-WithMessage "Não foi possível validar o repositório $Owner/$Repository."
    }

    Write-Host "Validando o escopo 'project' sem exibir o token..." -ForegroundColor Cyan
    try {
        $null = Invoke-Gh -GhArgs @("project", "list", "--owner", $Owner, "--limit", "1", "--format", "json")
    }
    catch {
        Write-Host "A autorização para Projects não está disponível. O GitHub abrirá um fluxo seguro para conceder o escopo 'project'." -ForegroundColor Yellow
        & gh auth refresh --hostname "github.com" --scopes "project"
        if ($LASTEXITCODE -ne 0) {
            Stop-WithMessage "Não foi possível conceder o escopo 'project'. Acesse o GitHub com a conta correta e tente novamente."
        }
        $null = Invoke-Gh -GhArgs @("project", "list", "--owner", $Owner, "--limit", "1", "--format", "json")
    }

    $project = Get-ProjectByTitle
    if ($null -eq $project) {
        Write-Host "Criando o projeto pessoal '$ProjectTitle'..." -ForegroundColor Cyan
        $null = Invoke-Gh -GhArgs @(
            "project", "create",
            "--owner", $Owner,
            "--title", $ProjectTitle,
            "--format", "json"
        )
        $project = Get-ProjectByTitle
        if ($null -eq $project) {
            throw "O GitHub informou sucesso, mas o projeto criado não foi localizado."
        }
    }
    else {
        Write-Host "Projeto existente encontrado; nenhum projeto duplicado será criado." -ForegroundColor Green
    }

    $projectNumber = [int]$project.number
    $projectViewJson = Invoke-Gh -GhArgs @(
        "project", "view", "$projectNumber",
        "--owner", $Owner,
        "--format", "json"
    )
    $projectView = $projectViewJson | ConvertFrom-Json
    $projectId = [string]$projectView.id
    $projectUrl = [string]$projectView.url

    $targetRepository = "$Owner/$Repository"
    $linkedRepositories = @(Get-LinkedRepositoryNames -ProjectId $projectId)
    if ($targetRepository -in $linkedRepositories) {
        Write-Host "Projeto já vinculado a $targetRepository; mantendo o vínculo existente." -ForegroundColor Green
    }
    else {
        Write-Host "Vinculando o Project ao repositório $targetRepository..." -ForegroundColor Cyan
        try {
            $null = Invoke-Gh -GhArgs @(
                "project", "link", "$projectNumber",
                "--owner", $Owner,
                "--repo", $targetRepository
            )
        }
        catch {
            # Uma execução simultânea pode ter criado o vínculo após a consulta.
            $linkedAfterAttempt = @(Get-LinkedRepositoryNames -ProjectId $projectId)
            if ($targetRepository -notin $linkedAfterAttempt) {
                throw
            }
            Write-Host "O projeto já estava vinculado por outra execução; continuando." -ForegroundColor Green
        }
    }

    $itemsByTitle = @{}
    foreach ($item in @(Get-ProjectItems -ProjectNumber $projectNumber)) {
        $itemTitle = Get-ItemTitle -Item $item
        if (-not [string]::IsNullOrWhiteSpace($itemTitle) -and -not $itemsByTitle.ContainsKey($itemTitle)) {
            $itemsByTitle[$itemTitle] = $item
        }
    }

    foreach ($task in $Tasks) {
        if ($itemsByTitle.ContainsKey($task.Title)) {
            Write-Host "Reutilizando item: $($task.Title)" -ForegroundColor DarkGray
            continue
        }

        $acceptanceLines = ($task.Acceptance | ForEach-Object { "- $_" }) -join [Environment]::NewLine
        $body = @"
Semana: $($task.Week)
Ordem: $($task.Order)

Critérios de aceite:
$acceptanceLines

Origem: docs/kanban.md e plano do projeto Chegolá?.
"@
        Write-Host "Adicionando item: $($task.Title)" -ForegroundColor Cyan
        $null = Invoke-Gh -GhArgs @(
            "project", "item-create", "$projectNumber",
            "--owner", $Owner,
            "--title", $task.Title,
            "--body", $body,
            "--format", "json"
        )
    }

    # Atualiza a lista para obter os IDs dos itens recém-criados.
    $itemsByTitle = @{}
    foreach ($item in @(Get-ProjectItems -ProjectNumber $projectNumber)) {
        $itemTitle = Get-ItemTitle -Item $item
        if (-not [string]::IsNullOrWhiteSpace($itemTitle) -and -not $itemsByTitle.ContainsKey($itemTitle)) {
            $itemsByTitle[$itemTitle] = $item
        }
    }

    $fieldListJson = Invoke-Gh -GhArgs @(
        "project", "field-list", "$projectNumber",
        "--owner", $Owner,
        "--limit", "100",
        "--format", "json"
    )
    $fields = @(($fieldListJson | ConvertFrom-Json).fields)

    $statusField = $fields |
        Where-Object {
            $_.name -ceq "Status" -and
            (@($_.options | ForEach-Object { $_.name }) | Where-Object { $_ -in $RequiredStatuses }).Count -eq $RequiredStatuses.Count
        } |
        Select-Object -First 1

    if ($null -eq $statusField) {
        $statusField = $fields |
            Where-Object { $_.name -ceq "Status MVP" } |
            Select-Object -First 1
    }

    if ($null -eq $statusField) {
        Write-Host "O campo Status padrão não contém todas as etapas. Criando o campo seguro 'Status MVP' sem alterar campos existentes..." -ForegroundColor Yellow
        $null = Invoke-Gh -GhArgs @(
            "project", "field-create", "$projectNumber",
            "--owner", $Owner,
            "--name", "Status MVP",
            "--data-type", "SINGLE_SELECT",
            "--single-select-options", ($RequiredStatuses -join ",")
        )

        $fieldListJson = Invoke-Gh -GhArgs @(
            "project", "field-list", "$projectNumber",
            "--owner", $Owner,
            "--limit", "100",
            "--format", "json"
        )
        $fields = @(($fieldListJson | ConvertFrom-Json).fields)
        $statusField = $fields |
            Where-Object { $_.name -ceq "Status MVP" } |
            Select-Object -First 1
    }

    if ($null -eq $statusField) {
        throw "Não foi possível localizar nem criar um campo de status."
    }

    $availableOptions = @($statusField.options | ForEach-Object { $_.name })
    $missingStatuses = @($RequiredStatuses | Where-Object { $_ -notin $availableOptions })
    if ($missingStatuses.Count -gt 0) {
        throw "O campo '$($statusField.name)' já existe, mas não possui: $($missingStatuses -join ', '). O script não altera nem apaga opções existentes automaticamente."
    }

    $readyOption = @($statusField.options | Where-Object { $_.name -ceq "Ready" }) | Select-Object -First 1
    $backlogOption = @($statusField.options | Where-Object { $_.name -ceq "Backlog" }) | Select-Object -First 1

    foreach ($task in $Tasks) {
        $item = $itemsByTitle[$task.Title]
        if ($null -eq $item) {
            throw "O item '$($task.Title)' não foi localizado após a criação."
        }

        $itemId = [string](Get-ObjectProperty -InputObject $item -Name "id")
        if ([string]::IsNullOrWhiteSpace($itemId)) {
            throw "O GitHub não retornou o ID do item '$($task.Title)'."
        }

        $targetOption = if ($task.Week -eq 1) { $readyOption } else { $backlogOption }
        $targetName = if ($task.Week -eq 1) { "Ready" } else { "Backlog" }
        Write-Host "Definindo '$($task.Title)' como $targetName..." -ForegroundColor DarkGray

        $null = Invoke-Gh -GhArgs @(
            "project", "item-edit",
            "--id", $itemId,
            "--project-id", $projectId,
            "--field-id", ([string]$statusField.id),
            "--single-select-option-id", ([string]$targetOption.id)
        )
    }

    Write-Host ""
    Write-Host "Kanban pronto. Nenhum projeto ou item existente foi apagado." -ForegroundColor Green
    Write-Host "URL: $projectUrl" -ForegroundColor Green
}
catch {
    Stop-WithMessage "Não foi possível concluir a criação do Kanban.`n$($_.Exception.Message)"
}
