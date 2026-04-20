# n8n-nodes-ekyte

This is an n8n community node that lets you integrate with the eKyte API to manage tasks, projects, tickets, boards, workspaces, notes, notifications, artifacts, task forms, and insertion orders (persons, addresses, contacts, bank data).

eKyte is a Digital Marketing Management Platform for High Performance.

## AI Tool Support

This node is configured with `usableAsTool: true`, which means it can be used as a tool by AI agents in n8n. All operations and parameters have detailed descriptions to help AI understand and use each field correctly.

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `@ekyte/n8n-nodes-ekyte` in **Enter npm package name**
4. Agree to the risks of using community nodes
5. Select **Install**

After installation, the eKyte node will be available in your n8n workflows.

### Manual Installation

```bash
npm install @ekyte/n8n-nodes-ekyte
```

## Credentials

You'll need to configure the eKyte API credentials:

1. **API Key**: Your eKyte API key
2. **Company ID**: Your eKyte company identifier

To obtain these credentials:

1. Log into your eKyte account
2. Navigate to your API settings
3. Generate an API key if you don't have one
4. Note your Company ID

## Resources and Operations

The eKyte node is organized by resources, each with specific operations.

### Artifact

- **Create**: Create a new artifact to be attached to a ticket (supports binary file upload)

### Board

- **Create**: Create a new board for organizing notes and planning content
- **Get All**: Retrieve all boards accessible to the authenticated user

### Insertion Order

Manages person records and their sub-entities (addresses, contacts, bank data) for insertion orders (PIs).

- **Create**: Create an insertion order person record
- **Create Address**: Create an address record for a person
- **Create Bank Data**: Create a bank data record for a person
- **Create Contact**: Create a contact record for a person
- **Get**: Retrieve a person by ID
- **Get Many**: Retrieve persons by filter

### Note

- **Create**: Create a new note inside a board with title, content, and category

### Notification

- **Get All**: Retrieve all unread notifications for the specified user

### Project

- **Create**: Create a new project to group related tasks and track progress
- **Get All**: Retrieve all projects accessible to the authenticated user

### Task

- **Create**: Create a new task with title, dates, priority, and assignment
- **Get**: Retrieve a single task by its unique ID
- **Get Many (with Filters)**: Search and filter tasks by title, status, workspace, executor, squad, project, or date range
- **Get Recent**: Retrieve tasks created or updated in the last 15 minutes (basic info)
- **Get Recent (with Phase)**: Retrieve tasks created or updated in the last 15 minutes including current phase/stage information

### Task Form

- **Get Many (with Filters)**: Search and filter task forms by form type, name, or form ID

### Ticket

- **Create**: Create a new ticket with subject, type, priority, and requester information
- **Get Concluded**: Retrieve tickets that were concluded/closed in the last 15 minutes
- **Get Many (with Filters)**: Search and filter tickets by workspace, executor, requester, type, status, phase, start/end date, and concluded date range
- **Get Updated**: Retrieve tickets that had any changes/updates in the last 15 minutes

### Workspace

- **Create**: Create a new workspace for a team or department
- **Get All**: Retrieve all workspaces accessible to the authenticated user

## Node Usage

1. Add the eKyte node to your workflow
2. Configure your eKyte API credentials
3. Select the desired resource
4. Choose the operation for the selected resource
5. Provide the required user email (when applicable)
6. Configure operation-specific parameters
7. Execute the workflow

## API Reference

This node integrates with the eKyte API. The default base URL is `https://api.ekyte.com/n8n` (configurable via a hidden `baseUrl` parameter on the node).

For detailed API documentation, visit the [eKyte integration guide](https://www.ekyte.com/guide/pt-br/suporte/integracao-com-n8n/).

## Rate Limiting

This node implements rate limiting to prevent excessive calls and backend overload:

- **Get operations**: have a 5-minute rate limit per operation to avoid excessive calls. The state is persisted in `workflow.staticData` across executions.
- **Create operations**: no rate limiting applied, allowing unrestricted resource creation.

## Error Handling

- HTTP errors from the eKyte API are thrown as `NodeApiError`, preserving the HTTP status code and the API response body in the n8n error panel.
- Validation and logic errors (unsupported operation, rate-limit hit, missing parameters) are thrown as `NodeOperationError`.
- When the API returns an error body in the form `{ "error": { "id": "...", "message": "..." } }`, the message is surfaced directly in the n8n UI, prefixed with the error id when available.

## Requirements

- n8n version 1.0.0 or higher
- Node.js 20.15 or higher
- Valid eKyte account with API access

## Support

For issues, questions, or feature requests:

- Create an issue in the [GitHub repository](https://github.com/ekyte/n8n-nodes-ekyte)
- Contact the eKyte support team at atendimento@ekyte.com

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE.md) file for details.

## Contributing

Contributions are welcome. Please feel free to submit a Pull Request.
