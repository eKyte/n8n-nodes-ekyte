# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an n8n community node package that provides integration with the eKyte API. It allows n8n users to interact with eKyte resources (tasks, projects, tickets, boards, workspaces, notes, notifications) through workflow automation.

## Development Commands

```bash
# Install dependencies
npm install

# Build the package (clean, compile TypeScript, copy icons)
npm run build

# Development mode with watch
npm run dev

# Lint code
npm run lint

# Auto-fix linting issues
npm run lintfix

# Format code
npm run format

# Prepare for publishing (build + lint with strict rules)
npm run prepublishOnly
```

## Architecture

### Node Structure
The project follows n8n's community node pattern with a resource-operation hierarchy:

1. **Main Node** (`nodes/EKyte/EKyte.node.ts`): Defines UI configuration and routes execution to operation handlers
2. **Operation Handlers** (`nodes/EKyte/operations/*.ts`): Modular files for each resource type (Tasks, Projects, etc.)
3. **Credentials** (`credentials/EKyteApi.credentials.ts`): API authentication configuration
4. **Exports** (`index.ts` files): Orchestrate imports/exports

### Operation Handler Pattern
Each operation file follows this structure:
```typescript
export async function execute(this: IExecuteFunctions): Promise<any> {
    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('eKyteApi');
    
    const credentialParams = {
        apiKey: credentials.apiKey,
        CompanyId: credentials.companyId,
        UserEmail: this.getNodeParameter('userEmail', 0),
    };
    
    switch (operation) {
        case 'getAll': // GET operations
        case 'create': // POST operations
        default: // Error handling
    }
}
```

### API Integration
- **Base URL**: `https://apistaging.ekyte.com/zapier`
- **Authentication**: API key + Company ID passed as query parameters
- **Request Pattern**: Credentials in query string, POST data in JSON body
- **Parameter Casing**: n8n uses camelCase, eKyte API expects PascalCase

## Adding New Resources

1. Create operation file in `nodes/EKyte/operations/`
2. Add resource to main node's resource options
3. Define operations and parameters with proper `displayOptions`
4. Export execute function and import in `nodes/EKyte/index.ts`
5. Add routing case in main node's execute method

## Adding New Operations

1. Add operation option to existing resource in main node
2. Add required parameters with appropriate `displayOptions`
3. Implement operation case in corresponding operation file

## Code Standards

- Use n8n's ESLint configuration with strict rules for community packages
- Follow existing patterns for parameter naming and API request structure
- Maintain consistent error handling across operations
- All API requests use `this.helpers.request()` from n8n framework
- Parameters should include proper descriptions and display options

## Build Process

The build process compiles TypeScript to CommonJS and copies SVG icons to the dist folder. Only the `dist/` directory is published to npm. The package uses Gulp for asset processing and rimraf for cleaning.