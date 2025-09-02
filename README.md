# n8n-nodes-ekyte

This is an n8n community node that lets you integrate with the eKyte API to manage tasks, projects, tickets, boards, workspaces, notes, and notifications.

eKyte is a Digital Marketing Management Platform for High Performance.

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
- **Create**: Create a new eKyte board
- **Get All**: Retrieve all boards

### Note
- **Create**: Create a new note

### Project
- **Create**: Create a new project
- **Get All**: Retrieve all projects

### Task
- **Create**: Create a new task
- **Get All**: Retrieve all tasks
- **Get All with Phase**: Retrieve tasks with phase information

### Ticket
- **Create**: Create a new support ticket
- **Get Changed**: Retrieve tickets updated in the last 15 minutes
- **Get Closed**: Retrieve tickets closed in the last 15 minutes

### Notification
- **Get All**: Retrieve notifications for a user

### Workspace
- **Create**: Create a new workspace
- **Get All**: Retrieve all workspaces

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

This node implements rate limiting to ensure compliance with eKyte API limits. All operations are automatically throttled to prevent exceeding API quotas.
