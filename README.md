# n8n-nodes-ekyte

This is an n8n community node that lets you integrate with the eKyte API to manage tasks, projects, tickets, boards, workspaces, notes, and notifications.

eKyte is a Digital Marketing Management Platform for High Performance.

## AI Tool Support

This node is configured with `usableAsTool: true`, which means it can be used as a tool by AI agents in n8n. All operations have detailed descriptions to help AI understand and use each field correctly.

## Installation

### Community Nodes (Recommended)

1. Go to **Settings > Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-ekyte` in **Enter npm package name**
4. Agree to the risks of using community nodes
5. Select **Install**

After installation, the eKyte node will be available in your n8n workflows.

### Manual Installation

To install this node locally:

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

The eKyte node is organized by resources, each with specific operations:

### Board

- **Create**: Create a new board for organizing notes and planning content
- **Get All**: Retrieve all boards accessible to the authenticated user

### Note

- **Create**: Create a new note inside a board with title, content, and category

### Project

- **Create**: Create a new project to group related tasks and track progress
- **Get All**: Retrieve all projects accessible to the authenticated user

### Task

- **Create**: Create a new task with title, dates, priority, and assignment
- **Get**: Retrieve a single task by its unique ID
- **Get Many (with Filters)**: Search and filter tasks by title, status, workspace, executor, squad, project, or date range
- **Get Recent**: Retrieve tasks created or updated in the last 15 minutes (basic info)
- **Get Recent (with Phase)**: Retrieve tasks with phase/stage information from the last 15 minutes

### Ticket

- **Create**: Create a new support ticket with subject, type, priority, and requester information
- **Get Concluded**: Retrieve tickets that were concluded/closed in the last 15 minutes
- **Get Updated**: Retrieve tickets that had any changes/updates in the last 15 minutes

### Notification

- **Get All**: Retrieve all unread notifications for the specified user

### Workspace

- **Create**: Create a new workspace for a team or department
- **Get All**: Retrieve all workspaces accessible to the authenticated user

## Node Usage

1. Add the eKyte node to your workflow
2. Configure your eKyte API credentials
3. Select the desired resource (Board, Note, Project, Task, Ticket, Notification, or Workspace)
4. Choose the operation for the selected resource
5. Provide the required user email (when applicable)
6. Configure operation-specific parameters
7. Execute the workflow

## API Reference

This node integrates with the eKyte API at `https://api.ekyte.com/n8n`. For detailed API documentation, visit the [eKyte integration guide](https://www.ekyte.com/guide/pt-br/suporte/integracao-com-n8n/).

## Version History

- **1.0.0**: Initial release with core eKyte operations

## Requirements

- n8n version 1.0.0 or higher
- Node.js 20.15 or higher
- Valid eKyte account with API access

## Support

For issues, questions, or feature requests:

- Create an issue in the [GitHub repository](https://github.com/ekyte/n8n-nodes-ekyte)
- Contact the eKyte support team at atendimento@ekyte.com

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Rate Limiting

This node implements rate limiting to prevent excessive calls and backend overload:

- **Get Operations**: Have a 5-minute rate limit for the same operation to avoid excessive calls
- **Create Operations**: No rate limiting applied, allowing unrestricted resource creation
