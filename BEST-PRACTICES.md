# Best Practices — n8n-nodes-ekyte

Guia de referência rápida para desenvolvedores que trabalham neste projeto.

---

## 1. Idioma da UI

Todos os textos visíveis ao usuário no node **devem ser em inglês**, independente do idioma interno do projeto.

Isso inclui: `displayName`, `description`, `placeholder`, `name` (dentro de options).

```typescript
// Correto
displayName: 'Start Date',
description: 'The date when work on this task should begin',

// Errado
displayName: 'Data de Início',
description: 'A data de início da tarefa',
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

Toda chamada de API deve estar dentro de `try-catch`, extraindo a mensagem de erro do body da resposta:

```typescript
try {
  result = await this.helpers.httpRequestWithAuthentication('eKyteApi', { ... });

  if (result.statusCode && result.statusCode >= 400) {
    const errorBody = typeof result.body === 'string'
      ? JSON.parse(result.body) : result.body;
    throw new NodeOperationError(this.getNode(),
      errorBody?.text || errorBody?.message || 'Request failed');
  }
} catch (error) {
  if (error instanceof NodeOperationError) throw error;
  throw new NodeOperationError(this.getNode(),
    `Error executing operation: ${error.message}`);
}
```

---

## 7. Rate Limiting

Operations de leitura (`get*`) possuem rate limit de 5 minutos via `workflow.staticData`. Operations de criação (`create*`) **não** possuem rate limit.

Ao adicionar nova operation de leitura, ela será automaticamente limitada se o `value` começar com `get`.

---

## 8. Build e Validação

Antes de fazer push, **sempre** executar:

```bash
npm run build    # Compila TypeScript + copia ícones
npm run lint     # Verifica regras ESLint (incluindo regras n8n)
```

---

## 9. Checklist para nova Operation

- [ ] `name` em Title Case, sem repetir o resource
- [ ] `action` em sentence case, sem artigos, repetindo o resource
- [ ] `description` em sentence case, com artigos, repetindo o resource
- [ ] Todos os parâmetros com `description` em inglês
- [ ] Options em ordem alfabética pelo `name`
- [ ] Options vazias usando `name: 'Any'`
- [ ] `displayOptions` configurado para o resource + operation correto
- [ ] `pairedItem: { item: i }` no retorno dos dados
- [ ] Chamada HTTP usando `httpRequestWithAuthentication`
- [ ] Tratamento de erro com `try-catch` e parse do body
- [ ] `npm run build` e `npm run lint` passando sem erros
