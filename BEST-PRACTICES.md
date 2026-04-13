# Best Practices — n8n-nodes-ekyte

Guia de referência rápida para desenvolvedores que trabalham neste projeto.

---

## 1. Idioma da UI

Todos os textos visíveis ao usuário no node **devem ser em inglês**, independente do idioma interno do projeto.

Isso inclui: `displayName`, `description`, `placeholder`, `name` (dentro de options).

**Importante:** Não inclua traduções ou termos em português entre parênteses. Isso também é reprovado na revisão.

```typescript
// Correto
displayName: 'Start Date',
description: 'The date when work on this task should begin',

// Correto
description: 'State registration number for legal entities',

// Errado — texto em português
displayName: 'Data de Início',
description: 'A data de início da tarefa',

// Errado — tradução entre parênteses
description: 'The state registration number (Inscrição Estadual) for legal entities',
```

### Termos do domínio

| Termo PT-BR | Tradução para UI |
|-------------|-----------------|
| PI (Pedido de Inserção) | Insertion Order |
| PF (Pessoa Física) | Individual |
| PJ (Pessoa Jurídica) | Legal Entity |

---

## 2. Naming de Operations

Cada operation possui 3 campos textuais. Cada um segue regras diferentes:

| Campo | Case | Artigos (a, an, the) | Repete resource? |
|-------|------|---------------------|-----------------|
| `name` | Title Case | Omitir | Não |
| `action` | Sentence case | Omitir | Sim |
| `description` | Sentence case | Incluir | Sim |

### Exemplo prático (resource: Board)

```typescript
{
  name: 'Get All',                    // Title Case, sem artigos, sem "Board"
  value: 'getBoards',
  action: 'Get all boards',           // Sentence case, sem artigos, repete "boards"
  description: 'Retrieve all boards accessible to the authenticated user',
                                      // Sentence case, com artigos, repete "boards"
}
```

### Sub-entidades

Quando a operation atua sobre uma sub-entidade, incluir o nome dela no `name` (sem repetir o resource pai):

```typescript
// Resource: Insertion Order
{ name: 'Create Address', ... }     // Correto — inclui sub-entidade
{ name: 'Create Person Address' }   // Errado — repete o resource pai
```

### Nomes CRUD convencionais

Usar sempre: `Create`, `Get`, `Get All`, `Get Many`, `Update`, `Delete`.

---

## 3. Parâmetros

### Todo parâmetro deve ter `description`

Isso é obrigatório porque o node usa `usableAsTool: true` — AI agents dependem das descriptions para preencher campos automaticamente.

```typescript
// Correto
{
  displayName: 'Zip Code',
  name: 'addressZipCode',
  type: 'string',
  default: '',
  description: 'The postal/zip code of the address',
}

// Errado — falta description
{
  displayName: 'Zip Code',
  name: 'addressZipCode',
  type: 'string',
  default: '',
}
```

### Options vazias

Nunca usar `name: ''`. Usar `name: 'Any'` ou outro label descritivo:

```typescript
// Correto
{ name: 'Any', value: '' }

// Errado
{ name: '', value: '' }
```

### Ordenação alfabética

As options devem estar em **ordem alfabética** pelo campo `name`. O ESLint irá apontar erro se não estiverem.

---

## 4. pairedItem

Incluir `pairedItem: { item: i }` em **todos** os objetos de retorno. Sem isso, expressões em nodes downstream podem quebrar.

```typescript
returnData = items.map((item: any, i: number) => ({
  json: item,
  pairedItem: { item: i },
}));
```

---

## 5. HTTP e Autenticação

Sempre usar o helper com autenticação:

```typescript
// Correto
this.helpers.httpRequestWithAuthentication('eKyteApi', requestOptions)

// Errado — método depreciado
this.helpers.request(requestOptions)
```

---

## 6. Tratamento de Erros

### NodeApiError vs NodeOperationError — Quando usar cada um?

O n8n tem dois tipos de erro. Usar o tipo errado faz com que o painel de erros do n8n perca informações importantes.

| Tipo | Quando usar | O que acontece no n8n |
|------|------------|----------------------|
| `NodeApiError` | Erro vindo de uma chamada HTTP (API retornou 400, 404, 500, etc.) | Mostra o status code HTTP + mensagem no painel de erros |
| `NodeOperationError` | Erro de lógica/validação (operação não suportada, parâmetro inválido) | Mostra apenas a mensagem de texto |

> **Regra simples:** Se o erro veio de uma chamada HTTP → `NodeApiError`. Se não → `NodeOperationError`.

### Exemplo: Erro HTTP (chamada de API que falhou)

```typescript
// Correto — usa NodeApiError, preserva status code
if (result.statusCode && result.statusCode >= 400) {
  let errorMessage = `Error executing operation ${operation}`;
  try {
    const errorBody = typeof result.body === 'string'
      ? JSON.parse(result.body) : result.body;
    if (errorBody && errorBody.text) {
      errorMessage = errorBody.id
        ? `[Error ${errorBody.id}] ${errorBody.text}`
        : errorBody.text;
    } else if (errorBody && errorBody.message) {
      errorMessage = errorBody.message;
    }
  } catch (parseError) {
    errorMessage = `Error ${result.statusCode}: ${result.statusMessage || 'Request failed'}`;
  }
  throw new NodeApiError(this.getNode(), {
    message: errorMessage,
    statusCode: result.statusCode,
  } as JsonObject, {
    message: errorMessage,
    httpCode: String(result.statusCode),
  });
}
```

```typescript
// Errado — usa NodeOperationError para erro HTTP (perde o status code)
throw new NodeOperationError(this.getNode(), errorMessage);
```

### Exemplo: Erro de lógica (operação não suportada)

```typescript
// Correto — usa NodeOperationError para validação
throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
```

### Imports necessários

Lembre-se de importar ambos no topo do arquivo:

```typescript
import {
  // ... outros imports
  JsonObject,
  NodeApiError,
  NodeOperationError,
} from 'n8n-workflow';
```

---

## 7. Sem dependências externas (npm packages)

O n8n Cloud **não permite** community nodes que importam pacotes npm externos. Isso bloqueia a publicação.

```typescript
// PROIBIDO — importa pacote externo
import FormData from 'form-data';
import axios from 'axios';
import _ from 'lodash';

// PERMITIDO — imports do n8n e do Node.js
import { NodeApiError, NodeOperationError } from 'n8n-workflow';
```

### O que usar no lugar?

| Pacote externo | Substituto nativo (Node 18+) |
|---------------|------------------------------|
| `form-data` | `FormData` global (já existe no Node.js) |
| `axios` | `this.helpers.httpRequestWithAuthentication()` (helper do n8n) |
| `node-fetch` | `fetch` global (já existe no Node.js) |

### Como verificar?

Olhe os `import` no topo do arquivo. **Somente** imports de `n8n-workflow` e arquivos locais do projeto são permitidos.

---

## 8. Sem dead code

Código inalcançável (que nunca executa) deve ser removido. Isso é apontado na revisão do n8n.

```typescript
// Errado — break nunca executa (está depois do return)
return [returnData];
break;

// Correto — apenas o return
return [returnData];
```

Outros exemplos de dead code para evitar:
- Variáveis declaradas mas nunca usadas
- Blocos de código comentados (`// código antigo aqui...`)
- Condições que nunca são verdadeiras

---

## 9. Rate Limiting

Operations de leitura (`get*`) possuem rate limit de 5 minutos via `workflow.staticData`. Operations de criação (`create*`) **não** possuem rate limit.

Ao adicionar nova operation de leitura, ela será automaticamente limitada se o `value` começar com `get`.

---

## 10. Build e Validação

Antes de fazer push, **sempre** executar:

```bash
npm run build    # Compila TypeScript + copia ícones
npm run lint     # Verifica regras ESLint (incluindo regras n8n)
```

---

## 11. Checklist para nova Operation

Use esta checklist antes de abrir PR. Itens marcados com ⚠️ **bloqueiam publicação** no n8n Cloud.

### Naming e UI
- [ ] `name` em Title Case, sem repetir o resource
- [ ] `action` em sentence case, sem artigos, repetindo o resource
- [ ] `description` em sentence case, com artigos, repetindo o resource
- [ ] Todos os parâmetros com `description` em inglês
- [ ] ⚠️ Nenhum texto em português (nem entre parênteses)
- [ ] Options em ordem alfabética pelo `name`
- [ ] Options vazias usando `name: 'Any'`

### Código
- [ ] `displayOptions` configurado para o resource + operation correto
- [ ] `pairedItem: { item: i }` no retorno dos dados
- [ ] Chamada HTTP usando `httpRequestWithAuthentication`
- [ ] ⚠️ Erros HTTP usando `NodeApiError` (não `NodeOperationError`)
- [ ] ⚠️ Sem imports de pacotes npm externos
- [ ] ⚠️ Sem dead code (break após return, variáveis não usadas)

### Build
- [ ] `npm run build` passando sem erros
- [ ] `npm run lint` passando sem erros
