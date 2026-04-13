# Revisao de Codigo — n8n Guidelines, UI Language, Resource & Operation Naming

Voce e um revisor de codigo especializado em n8n community nodes. Execute uma revisao completa do arquivo principal do node seguindo rigorosamente as regras oficiais n8n e as convencoes definidas no CLAUDE.md do projeto.

## Escopo da Revisao

Revise o arquivo `nodes/EKyte/EKyteAction.node.ts` nas seguintes categorias:

---

### 1. UI Language — Idioma dos textos de interface

**Regra:** Todos os elementos de UI do node (displayName, description, placeholder, option name/label) **devem estar em ingles**, conforme exigido pelo padrao n8n — independente do idioma interno do projeto.

- Busque por textos em portugues em campos: `displayName`, `description`, `placeholder`, `name` (dentro de options)
- Busque por abreviacoes em portugues (ex: PF, PJ) que nao sao compreensiveis internacionalmente
- Verifique se opcoes vazias `{ name: '', value: '' }` existem — devem usar `name: 'Any'` ou label descritivo

---

### 2. Resource & Operation Naming

Siga estritamente a tabela de regras oficiais n8n:

| Campo           | Case           | Artigos (a, an, the) | Repete resource?                              |
|-----------------|----------------|-----------------------|-----------------------------------------------|
| **name**        | Title Case     | Omitir                | Nao repetir (resource ja aparece acima)        |
| **action**      | Sentence case  | **Omitir**            | Sim, repetir o resource                        |
| **description** | Sentence case  | **Incluir** p/ clareza| Sim, repetir o resource                        |

Regras adicionais:
- Operation `name`: nao usar parenteses desnecessarios, nao repetir o nome do resource
- Sub-entities: incluir o nome da sub-entidade no `name` (ex: "Create Address" ao inves de "Create Person Address")
- Nomes CRUD convencionais: `create`, `get`, `getAll`, `update`, `delete`
- Operation Name: Title Case, sem artigos, sem repetir resource
- Operation Action: Sentence case, sem artigos, repete resource
- Operation Description: Sentence case, com artigos, repete resource

Verifique TODOS os blocos de operation `{ name, value, action, description }` no arquivo.

---

### 3. Parametros — Descriptions e Naming

- **Todo parametro deve ter `description`** — isso e obrigatorio especialmente quando `usableAsTool: true`, pois AI agents dependem das descriptions para preencher campos
- Descriptions devem ser em ingles, sentence case, claras e descritivas
- displayName deve ser Title Case
- Verifique se ha parametros com description ausente, vazia, ou em portugues

---

### 4. n8n Cloud Verification — Regras obrigatorias para publicacao

Estas regras sao exigidas pelo time do n8n para aprovacao em n8n Cloud. Violacoes bloqueiam a publicacao.

#### 4a. Sem dependencias externas (npm packages)

- **O node NAO pode importar pacotes npm externos** (ex: `import FormData from 'form-data'`)
- n8n Cloud nao permite community nodes com dependencias externas
- Use APIs nativas do Node.js (Node 18+) ou helpers built-in do n8n
- Exemplos: use `FormData` global (nativo), nao o pacote `form-data`; use `fetch` global, nao `axios`
- Verifique TODOS os `import` no topo do arquivo — somente imports de `n8n-workflow` e arquivos locais sao permitidos
- Referencia: https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/

#### 4b. NodeApiError para erros HTTP (nao NodeOperationError)

- Operacoes que fazem chamadas HTTP e tratam erros **devem usar `NodeApiError`** (nao `NodeOperationError`)
- `NodeOperationError` perde o status code HTTP e o contexto da resposta no painel de erros do n8n
- Uso correto: `throw new NodeApiError(this.getNode(), { message, statusCode } as JsonObject, { message, httpCode })`
- `NodeOperationError` deve ser reservado apenas para erros de validacao/logica (ex: operacao nao suportada)
- Verifique TODOS os `throw new NodeOperationError` no arquivo — se o contexto e uma falha HTTP, deve ser `NodeApiError`
- Referencia: https://docs.n8n.io/integrations/creating-nodes/build/reference/http-helpers/

#### 4c. Sem dead code

- Verifique codigo inalcancavel: `break` apos `return`, variaveis nao usadas, blocos de codigo morto
- Exemplo: `return [returnData]; break;` — o `break` e inalcancavel e deve ser removido

#### 4d. Sem termos em outros idiomas nas descriptions

- Descriptions, placeholders e labels **devem estar 100% em ingles**
- NAO incluir traducoes entre parenteses em outros idiomas (ex: "State registration (Inscricao Estadual)")
- Se necessario dar contexto, use termos em ingles (ex: "State registration number for legal entities")
- Referencia: https://docs.n8n.io/integrations/creating-nodes/build/reference/verification-guidelines/

---

### 5. Validacoes Adicionais

- Options com `name: ''` (anti-pattern) — devem ter label descritivo
- Verifique consistencia entre options do mesmo tipo (ex: se um filtro usa 'Any', todos devem)
- Verifique erros gramaticais em descriptions em ingles
- **ESLint: opcoes de resource e form type devem estar em ordem alfabetica** — verifique se as opcoes dos campos `resource` e `formType` estao ordenadas alfabeticamente pelo campo `name`

---

## Geracao do Relatorio

Ao final da revisao, gere um relatorio em arquivo Markdown na raiz do projeto.

### Nomenclatura do arquivo

`REVIEW-N8N-GUIDELINES-UI-NAMING-LANGUAGE-{TIMESTAMP}_{REV}.md`

- `{TIMESTAMP}` = data no formato `YYYYMMDD`
- `{REV}` = numero da revisao do dia, comecando em 1

Para determinar o REV:
1. Liste os arquivos existentes com pattern `REVIEW-N8N-GUIDELINES-UI-NAMING-LANGUAGE-{TIMESTAMP_HOJE}_*.md`
2. Se nenhum existir, REV = 1
3. Se existirem, REV = maior numero encontrado + 1

### Estrutura do Relatorio

```markdown
# Revisao de Codigo — Guidelines, UI Language, Resource & Operation Naming

**Data:** YYYY-MM-DD
**Revisao:** REV
**Arquivo:** `nodes/EKyte/EKyteAction.node.ts`
**Referencia:** [n8n UX Guidelines](https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/)

---

## Regras oficiais n8n (resumo)

[Tabela com as regras de naming]

---

## 1. UI Language — Textos em portugues (devem ser em ingles)

[Tabela: Linha | Campo | Texto atual | Correcao sugerida]

---

## 2. Resource & Operation Naming

### 2a. Campo `name` — problemas encontrados
[Tabela: Linha | Operacao | Valor atual | Problema | Correcao]

### 2b. Campo `action` — problemas encontrados
[Tabela ou "OK — todos seguem o padrao"]

### 2c. Campo `description` — problemas encontrados
[Tabela: Linha | Operacao | Valor atual | Problema | Correcao]

---

## 3. Parametros sem `description`

[Tabelas agrupadas por recurso/operacao: Linha | displayName]

---

## 4. n8n Cloud Verification

### 4a. Dependencias externas
[Tabela: Linha | Import | Problema | Correcao — ou "OK — nenhuma dependencia externa encontrada"]

### 4b. NodeApiError vs NodeOperationError
[Tabela: Linha | Operacao | Erro atual | Problema | Correcao — ou "OK — todos os erros HTTP usam NodeApiError"]

### 4c. Dead code
[Tabela: Linha | Codigo | Problema — ou "OK — nenhum dead code encontrado"]

### 4d. Termos em outros idiomas
[Tabela: Linha | Campo | Texto atual | Correcao — ou "OK — nenhum termo em outro idioma"]

---

## 5. Validacoes Adicionais

[Opcoes vazias, inconsistencias, erros gramaticais]

---

## 6. Resumo de prioridades

1. **Critica** — [Bloqueiam publicacao no n8n Cloud: dependencias externas, etc]
2. **Alta** — [issues criticos: NodeApiError, dead code]
3. **Media** — [issues moderados: naming, idioma]
4. **Baixa** — [issues menores: gramatica, consistencia]

---

## Estatisticas

- Total de issues encontrados: X
- Alta prioridade: X
- Media prioridade: X
- Baixa prioridade: X
```

---

## Instrucoes de Execucao

1. Leia o arquivo `nodes/EKyte/EKyteAction.node.ts` por completo
2. Analise cada categoria sistematicamente, anotando linha, campo, valor atual e correcao
3. Determine o REV correto verificando arquivos existentes
4. Gere o relatorio completo na raiz do projeto
5. Apresente um resumo ao usuario com as estatisticas e os issues mais criticos

**IMPORTANTE:** Esta skill e somente de revisao. NAO modifique o codigo fonte. Apenas gere o relatorio.
