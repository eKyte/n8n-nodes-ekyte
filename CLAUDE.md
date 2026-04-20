# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

n8n community node package (`@ekyte/n8n-nodes-ekyte`) that integrates with the eKyte project management platform API. Provides a single node ("eKyte") with multiple resources and operations for use in n8n workflows and AI agents.

## Build & Development Commands

- `npm run build` — Full build: cleans dist/, compiles TypeScript, copies SVG icons via gulp
- `npm run dev` — TypeScript watch mode for development
- `npm run lint` — ESLint check with n8n-specific rules
- `npm run lintfix` — ESLint with auto-fix
- `npm run format` — Prettier formatting on nodes/ and credentials/
- No test framework configured; testing is done manually in n8n workflows

## Architecture

### Entry Point

`index.ts` exports two classes: `EKyteApi` (credentials) and `EKyteAction` (node).

### Credentials (`credentials/EKyteApi.credentials.ts`)

Single credential type using generic query string authentication with `apiKey` and `companyId`. Test endpoint at `https://api.ekyte.com/n8n/polling/auth`.

### Node (`nodes/EKyte/EKyteAction.node.ts`)

Single monolithic node file (~2400 lines) implementing the **resource-operation pattern**:

- **Resources**: Board, Note, Project, Task, Ticket, Notification, Workspace, PI (Pessoas/Persons — includes sub-entities: Address, Contact, Bank Data)
- Each resource has operations (create, get, getAll, etc.)
- Parameters use `displayOptions` to show/hide fields based on selected resource + operation
- `usableAsTool: true` — the node is designed for AI agent consumption with detailed descriptions
- API base URL defaults to `https://api.ekyte.com/n8n` (configurable via hidden `baseUrl` param)

### Key Patterns

- **Rate limiting**: GET operations enforce a 5-minute minimum interval using `workflow.staticData` to store `lastCall_{operation}` timestamps. CREATE operations are not rate-limited.
- **HTTP requests**: Uses `this.helpers.httpRequestWithAuthentication('eKyteApi', ...)` for all API calls
- **Error handling**: Try-catch blocks parse error body JSON for detailed messages
- **File uploads**: Artifact resource uses `formData` with binary data from n8n items

### Build Pipeline

TypeScript compiles to `dist/` (CommonJS, ES2020 target, strict mode). Gulp copies `*.svg` and `*.png` from source to dist. The `package.json` `n8n` section registers the compiled credential and node paths.

## CI/CD

Bitbucket Pipelines with two branches:
- **develop**: Auto-publishes to npm with `beta` tag on push
- **master**: Manual trigger publishes to npm with `latest` tag

## Code Style

- Indentation: tabs (2-width)
- Single quotes, trailing commas, semicolons required
- ESLint enforces n8n-nodes-base plugin rules (class naming, parameter descriptions, icon format, etc.)
- ESLint requires alphabetical ordering of resource options and form type options
- Commit messages use Brazilian Portuguese task IDs: `Tarefa XXXXX - description`

## n8n Node Development Guidelines

Follow the official n8n UX and code standards when modifying this node:
https://docs.n8n.io/integrations/creating-nodes/build/reference/ux-guidelines/#ux-guidelines-for-community-nodes

### Resource & Operation Naming

- Use conventional CRUD operation names: `create`, `get`, `getAll`, `update`, `delete`
- Operation **Name** field: title case, do not repeat the resource (e.g. "Delete", "Get All")
- Operation **Action** field: sentence case, **omit articles** (a, an, the), repeat the resource (e.g. "Delete record", "Get all tasks")
- Operation **Description** field: sentence case, **include articles** for clarity, may use alternative wording (e.g. "Retrieve a list of users", "Delete all the rows in a sheet")
- When operating on a sub-entity inside a resource, include the entity name in the operation (e.g. "Delete Row" for rows in a sheet)

### Item Pairing (pairedItem)

Include `pairedItem: { item: i }` in **all** return data objects so n8n can link input items to output items. Without this, expressions in downstream nodes may break.

```typescript
returnData.push({
  json: responseData,
  pairedItem: { item: i },
});
```

Reference: https://docs.n8n.io/integrations/creating-nodes/build/reference/paired-items/

### HTTP Helpers & Authentication

- Always use `this.helpers.httpRequestWithAuthentication('eKyteApi', requestOptions)` — never use the deprecated `this.helpers.request()`
- Define the authentication method in the credentials class
- Reference: https://docs.n8n.io/integrations/creating-nodes/build/reference/http-helpers/

### UI Language

- All node UI elements (display names, descriptions, placeholders, option labels) **must be in English** as required by n8n standards, regardless of the project's internal language

### URLs & Configuration

- Do not hardcode API base URLs in the execute method. Use credential properties or configurable node parameters (like the existing `baseUrl` hidden param)

### Data Handling

- Never mutate incoming data directly. Clone input items before modifying them and return new data objects
- Always wrap API calls in try-catch with descriptive error messages parsed from the API response body

### n8n Cloud Verification Rules

These rules are enforced by the n8n team for Cloud approval. Violations block publication.

- **No external npm dependencies**: Community nodes cannot import external packages (e.g. `form-data`, `axios`, `lodash`). Only `n8n-workflow` and local file imports are allowed. Use Node.js built-in APIs (Node 18+) instead — e.g. global `FormData`, global `fetch`
- **NodeApiError for HTTP errors**: Use `NodeApiError` (not `NodeOperationError`) when throwing errors from HTTP responses. `NodeApiError` preserves HTTP status code and response context in the n8n error UI. Reserve `NodeOperationError` only for validation/logic errors (e.g. unsupported operation)
- **No dead code**: Remove unreachable code such as `break` after `return`, unused variables, or commented-out blocks
- **English-only UI text**: All descriptions, placeholders, and labels must be 100% in English. Do not include translations or terms in other languages, even in parentheses (e.g. avoid "State registration (Inscrição Estadual)" — use "State registration number" instead)
- Reference: https://docs.n8n.io/integrations/creating-nodes/deploy/submit-community-nodes/

### Additional Standards

- Include `usableAsTool: true` and detailed descriptions for AI agent compatibility
- Use `displayOptions` to conditionally show/hide parameters based on the selected resource + operation
- Rate limiting state should use `workflow.staticData` to persist across executions
- Icon must be SVG format

## Requirements

- Node.js >= 20.15
