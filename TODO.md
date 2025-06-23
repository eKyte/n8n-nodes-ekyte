Triggers:
- Notifications
	- description: Triggers when a new notification is created is changed
	- endpoint: {baseUrl}/notifications
- Project
	- description: Triggers when a new Project is created
	- endpoint: {baseUrl}/projects/created
- Tasks
	- description: Triggers when task is changed
	- endpoint: {baseUrl}/tasks
- Tasks Phase Done
	- description: Triggers when task is created or has a phase changed
	- endpoint: {baseUrl}/v2/tasks
- Tickets Changed
	- description: Triggers all tickets that have been updated in the last 15 minutes
	- endpoint: {baseUrl}/tickets/concluded
- Tickets Closed
	- description: Triggers all tickets that were closed in the last 15 minutes
	- endpoint: {baseUrl}/tickets/changes


Actions:
- Create Project
	- description: Create e new eKyte Project
	- endpoint: {baseUrl}/projects
- Create Board
	- description: Create e new eKyte Board
	- endpoint: {baseUrl}/boards
- Create Note
	- description: Create e new eKyte Note
	- endpoint: {baseUrl}/notes
- Create Task
	- description: Create e new eKyte Task
	- endpoint: {baseUrl}/tasks
- Create Ticket
	- description: Create e new eKyte Ticket
	- endpoint: {baseUrl}/tickets
- Create Workspace
	- description: Create e new eKyte Workspace
	- endpoint: {baseUrl}/workspaces
