import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

import FormData from 'form-data';

/**
 * Normalizes a multiOptions parameter value into a comma-separated string.
 * Handles arrays, comma-separated strings, single values, and stringified arrays
 * (e.g. "[10, 30]", "['10','30']") — safe for AI agent tool usage.
 */
function resolveMultiOptions(value: unknown): string {
	let raw: string[];
	if (Array.isArray(value)) {
		raw = value.map((s) => String(s));
	} else if (typeof value === 'string' && value.trim()) {
		raw = value.replace(/^\[|\]$/g, '').split(',');
	} else if (typeof value === 'number') {
		raw = [String(value)];
	} else {
		return '';
	}
	return raw
		.map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
		.filter(Boolean)
		.join(',');
}

export class EKyteAction implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'eKyte',
		name: 'eKyteAction',
		icon: 'file:ekyte.svg',
		group: ['transform'],
		version: 1,
		usableAsTool: true,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description:
			'Create and retrieve data from eKyte (tasks, projects, tickets, boards, workspaces, notes, notifications)',
		defaults: {
			name: 'eKyte',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'eKyteApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Artifact',
						value: 'artifacts',
					},
					{
						name: 'Board',
						value: 'board',
					},
					{
						name: 'Insertion Order',
						value: 'PI',
					},
					{
						name: 'Note',
						value: 'note',
					},
					{
						name: 'Notification',
						value: 'notifications',
					},
					{
						name: 'Project',
						value: 'project',
					},
					{
						name: 'Task',
						value: 'task',
					},
					{
						name: 'Task Form',
						value: 'taskForm',
					},
					{
						name: 'Ticket',
						value: 'ticket',
					},
					{
						name: 'Workspace',
						value: 'workspaces',
					},
				],
				default: 'task',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['board'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createBoard',
						description: 'Create a new board for organizing notes and planning content',
						action: 'Create board',
					},
					{
						name: 'Get All',
						value: 'getBoards',
						description: 'Retrieve all boards accessible to the authenticated user',
						action: 'Get all boards',
					},
				],
				default: 'createBoard',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['note'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createNote',
						description: 'Create a new note inside a board with title, content, and category',
						action: 'Create note',
					},
				],
				default: 'createNote',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['project'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createProject',
						description: 'Create a new project to group related tasks and track progress',
						action: 'Create project',
					},
					{
						name: 'Get All',
						value: 'getProjects',
						description: 'Retrieve all projects accessible to the authenticated user',
						action: 'Get all projects',
					},
				],
				default: 'createProject',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['task'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createTask',
						description: 'Create a new task in eKyte with title, dates, priority, and assignment',
						action: 'Create task',
					},
					{
						name: 'Get',
						value: 'getTask',
						description: 'Retrieve a single task by its unique ID',
						action: 'Get task',
					},
					{
						name: 'Get Many (with Filters)',
						value: 'getManyTasks',
						description:
							'Search and filter tasks by title, status, workspace, executor, squad, project, or date range',
						action: 'Get many tasks with filters',
					},
					{
						name: 'Get Recent',
						value: 'getTasks',
						description: 'Get tasks created or updated in the last 15 minutes (basic info)',
						action: 'Get recent tasks',
					},
					{
						name: 'Get Recent (with Phase)',
						value: 'getTasksPhase',
						description:
							'Get tasks created or updated in the last 15 minutes including current phase/stage information',
						action: 'Get recent tasks with phase',
					},
				],
				default: 'createTask',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['taskForm'],
					},
				},
				options: [
					{
						name: 'Get Many (with Filters)',
						value: 'getManyTaskForms',
						description: 'Search and filter task forms by form type, name, or form ID',
						action: 'Get many task forms with filters',
					},
				],
				default: 'getManyTaskForms',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['ticket'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createTicket',
						description:
							'Create a new ticket with subject, type, priority, and requester information',
						action: 'Create ticket',
					},
					{
						name: 'Get Many (with Filters)',
						value: 'getManyTickets',
						description:
							'Search and filter tickets by workspace, executor, requester, type, status, phase, start date, end date, and concluded date start/end',
						action: 'Get many tickets with filters',
					},
					{
						name: 'Get Concluded',
						value: 'getTicketsClosed',
						description: 'Get tickets that were concluded/closed in the last 15 minutes',
						action: 'Get concluded tickets',
					},
					{
						name: 'Get Updated',
						value: 'getTicketsChanged',
						description: 'Get tickets that had any changes/updates in the last 15 minutes',
						action: 'Get updated tickets',
					},
				],
				default: 'createTicket',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['notifications'],
					},
				},
				options: [
					{
						name: 'Get All',
						value: 'getNotifications',
						description: 'Retrieve all unread notifications for the specified user',
						action: 'Get all notifications',
					},
				],
				default: 'getNotifications',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['workspaces'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createWorkspace',
						description: 'Create a new workspace for a team or department',
						action: 'Create workspace',
					},
					{
						name: 'Get All',
						value: 'getWorkspaces',
						description: 'Retrieve all workspaces accessible to the authenticated user',
						action: 'Get all workspaces',
					},
				],
				default: 'createWorkspace',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['artifacts'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'addArtifact',
						description: 'Create a new artifact to be attached to a ticket',
						action: 'Create artifact',
					},
				],
				default: 'addArtifact',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['PI'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createPerson',
						description: 'Create an insertion order person record',
						action: 'Create insertion order person',
					},
					{
						name: 'Create Address',
						value: 'createPersonAddress',
						description: 'Create an address record for a person',
						action: 'Create person address',
					},
					{
						name: 'Create Bank Data',
						value: 'createPersonBankData',
						description: 'Create a bank data record for a person',
						action: 'Create person bank data',
					},
					{
						name: 'Create Contact',
						value: 'createPersonContact',
						description: 'Create a contact record for a person',
						action: 'Create person contact',
					},
					{
						name: 'Get',
						value: 'getPerson',
						description: 'Retrieve a person by ID',
						action: 'Get person',
					},
					{
						name: 'Get Many',
						value: 'getManyPersons',
						description: 'Retrieve persons by filter',
						action: 'Get many persons',
					},
				],
				default: 'getPerson',
			},
			{
				displayName: 'Base URL',
				name: 'baseUrl',
				type: 'hidden',
				default: 'https://apistaging.ekyte.com/n8n',
				description: 'The base URL for eKyte API',
			},
			{
				displayName: 'Email',
				name: 'userEmail',
				type: 'string',
				required: true,
				default: '',
				description: 'The email address of the eKyte user performing this operation',
				displayOptions: {
					show: {
						operation: [
							'addArtifact',
							'createTask',
							'createProject',
							'createTicket',
							'createBoard',
							'createNote',
							'createWorkspace',
							'getNotifications',
							'createPerson',
							'createPersonContact',
							'createPersonAddress',
							'createPersonBankData',
						],
					},
				},
			},
			// Task fields
			{
				displayName: 'Task ID',
				name: 'taskId',
				type: 'string',
				required: true,
				default: '',
				description:
					'The unique numeric identifier of the task to retrieve. You can find this ID in the task URL or by listing tasks first.',
				displayOptions: {
					show: {
						operation: ['getTask', 'getManyTaskForms'],
					},
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				default: '',
				description:
					'The title or name of the task. This should be a clear, concise description of what needs to be done.',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Task Type ID',
				name: 'ctcTaskTypeId',
				type: 'number',
				required: true,
				default: null,
				description: 'The numeric ID of the task type',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Workspace ID',
				name: 'workspaceId',
				type: 'string',
				required: true,
				default: '',
				description: 'The unique identifier of the workspace where the item will be created',
				displayOptions: {
					show: {
						operation: [
							'createTask',
							'createProject',
							'createTicket',
							'createBoard',
							'addArtifact',
						],
					},
				},
			},
			{
				displayName: 'Initial Executor',
				name: 'initialExecutor',
				type: 'string',
				default: '',
				description:
					'The email address of the team member who will be assigned to execute this task',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Priority',
				name: 'priorityGroup',
				type: 'number',
				required: true,
				default: 0,
				description:
					'Priority level as a number from 0 to 100. Values: 0 = Not prioritized, 1-25 = Low priority, 26-50 = Medium priority, 51-75 = High priority, 76-100 = Urgent. Higher numbers indicate more urgent items.',
				displayOptions: {
					show: {
						operation: ['createTask', 'createTicket'],
					},
				},
			},
			{
				displayName: 'Quantity',
				name: 'quantity',
				type: 'number',
				default: null,
				description: 'Optional quantity associated with this task',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'ctcTaskProjectId',
				type: 'number',
				default: null,
				description:
					'Optional project ID to associate this task with. Linking a task to a project helps organize related work and track project progress.',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'taskDescription',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional details and context for the task',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'projectDescription',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional details and context for the project',
				displayOptions: {
					show: {
						operation: ['createProject'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'boardDescription',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional details and context for the board',
				displayOptions: {
					show: {
						operation: ['createBoard'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'noteDescription',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional details and context for the note',
				displayOptions: {
					show: {
						operation: ['createNote'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'workspaceDescription',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Additional details and context for the workspace',
				displayOptions: {
					show: {
						operation: ['createWorkspace'],
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'phaseStartDate',
				type: 'dateTime',
				required: true,
				default: '',
				description:
					'The date when work on this task should begin. Use ISO 8601 format (e.g., 2024-01-15). This date is used for scheduling and workload planning.',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Due Date',
				name: 'currentDueDate',
				type: 'dateTime',
				required: true,
				default: '',
				description:
					'The deadline by which the task must be completed. Use ISO 8601 format (e.g., 2024-01-20). Tasks past their due date will be flagged as overdue.',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Effort (Minutes)',
				name: 'estimatedTime',
				type: 'number',
				required: true,
				default: 60,
				description:
					'The estimated effort required to complete this task, expressed in minutes. For example: 60 = 1 hour, 480 = 8 hours (1 day). Used for capacity planning and workload management.',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			{
				displayName: 'Planned Task',
				name: 'planTask',
				type: 'boolean',
				default: true,
				description: 'Whether this is a planned task',
				displayOptions: {
					show: {
						operation: ['createTask'],
					},
				},
			},
			// getManyTasks filter fields
			{
				displayName: 'Title',
				name: 'filterTitle',
				type: 'string',
				default: '',
				description:
					'Filter tasks by title. Returns tasks whose title contains this text (case-insensitive partial match).',
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'Situation',
				name: 'filterSituation',
				type: 'multiOptions',
				default: [],
				description:
					'Filter tasks by their current status. Select one or more situations: Active (in progress), Pause (temporarily stopped), Concluded (completed), Canceled (cancelled). Multiple selections are combined with OR logic.',
				options: [
					{
						name: 'Active',
						value: '10',
						description: 'Tasks currently in progress',
					},
					{
						name: 'Pause',
						value: '20',
						description: 'Tasks temporarily paused or on hold',
					},
					{
						name: 'Concluded',
						value: '30',
						description: 'Tasks that have been completed',
					},
					{
						name: 'Cancelled',
						value: '40',
						description: 'Tasks that were cancelled',
					},
				],
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'Workspace ID',
				name: 'filterWorkspaceId',
				type: 'string',
				default: '',
				description:
					'Filter tasks by workspace. Only returns tasks belonging to the specified workspace ID.',
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'Executor ID',
				name: 'filterExecutorId',
				type: 'string',
				default: '',
				description:
					'Filter tasks by the assigned executor. Only returns tasks assigned to the specified user ID.',
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'Squad ID',
				name: 'filterSquadId',
				type: 'string',
				default: '',
				description:
					'Filter tasks by squad. Only returns tasks belonging to the specified squad ID.',
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'Project ID',
				name: 'filterProjectId',
				type: 'string',
				default: '',
				description:
					'Filter tasks by project. Only returns tasks associated with the specified project ID.',
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'filterStartDate',
				type: 'dateTime',
				default: '',
				description:
					'Filter tasks from this date onwards. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-01-01).',
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'filterEndDate',
				type: 'dateTime',
				default: '',
				description:
					'Filter tasks until this date. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-12-31).',
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			{
				displayName: 'Period',
				name: 'filterPeriod',
				type: 'options',
				default: '1',
				description:
					'Defines which date field the Start Date and End Date filters apply to. Select Creation to filter by when tasks were created, or Conclusion to filter by when tasks were completed.',
				options: [
					{
						name: 'Creation',
						value: '1',
						description: 'Filter by task creation date',
					},
					{
						name: 'Conclusion',
						value: '2',
						description: 'Filter by task completion/conclusion date',
					},
				],
				displayOptions: {
					show: {
						operation: ['getManyTasks'],
					},
				},
			},
			// Project fields
			{
				displayName: 'Title',
				name: 'projectName',
				type: 'string',
				required: true,
				default: '',
				description:
					'The name of the project. Choose a clear, descriptive name that identifies the project purpose and scope.',
				displayOptions: {
					show: {
						operation: ['createProject'],
					},
				},
			},
			{
				displayName: 'Alias',
				name: 'alias',
				type: 'string',
				default: '',
				description: 'A short code or abbreviation for the project (e.g., "PROJ", "MKT2024")',
				displayOptions: {
					show: {
						operation: ['createProject'],
					},
				},
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description:
					'Comma-separated list of tags for categorizing and filtering the project (e.g., "marketing, Q1, high-priority")',
				displayOptions: {
					show: {
						operation: ['createProject'],
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'startDate',
				type: 'dateTime',
				default: '',
				description:
					'The planned start date for the project. Use ISO 8601 format (e.g., 2024-01-15). Helps with project timeline planning and scheduling.',
				displayOptions: {
					show: {
						operation: ['createProject'],
					},
				},
			},

			{
				displayName: 'Source Project ID',
				name: 'sourceProjectId',
				type: 'number',
				default: 0,
				description: 'The ID of an existing project to use as a template for the new project',
				displayOptions: {
					show: {
						operation: ['createProject'],
					},
				},
			},
			// Ticket fields
			{
				displayName: 'Subject',
				name: 'subject',
				type: 'string',
				required: true,
				default: '',
				description:
					'The subject line of the ticket. Should be a brief summary of the issue or request being reported.',
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
			{
				displayName: 'Ticket Type',
				name: 'ticketType',
				type: 'options',
				required: true,
				default: '1',
				description: 'The category of the ticket being created',
				options: [
					{
						name: 'Request',
						value: '1',
						description: 'General service request',
					},
					{
						name: 'Question',
						value: '2',
						description: 'Inquiry needing an answer',
					},
					{
						name: 'Bug Fix',
						value: '3',
						description: 'Defect or error report',
					},
					{
						name: 'Quote',
						value: '4',
						description: 'Pricing or proposal request',
					},
					{
						name: 'Improvement',
						value: '5',
						description: 'Feature improvement suggestion',
					},
				],
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
			{
				displayName: 'Expected Due Date',
				name: 'expectDueDate',
				type: 'dateTime',
				default: '',
				description:
					'The expected resolution date for this ticket. Use ISO 8601 format (e.g., 2024-01-20).',
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
			{
				displayName: 'Requester Email',
				name: 'requesterEmail',
				type: 'string',
				required: true,
				default: '',
				description:
					'The person who created the request. Can be a user with any profile, including guest (not part of the team).',
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
			{
				displayName: 'CC Users',
				name: 'usersCC',
				type: 'string',
				default: '',
				description: 'CC user emails, separated by comma',
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
			{
				displayName: 'Analyst Email',
				name: 'analystEmail',
				type: 'string',
				default: '',
				description:
					'The main responsible for handling the ticket. If not provided, a default analyst is automatically assigned according to the professionals and teams routine, "Service" column.',
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
			{
				displayName: 'Description',
				name: 'ticketMessage',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description:
					'Detailed description of the ticket. Include all relevant information such as steps to reproduce, specific requirements, or context needed to address the request.',
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
			{
				displayName: 'Company ID',
				name: 'filterCompanyId',
				type: 'string',
				default: '',
				description: 'Company identifier',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Workspace ID',
				name: 'filterWorkspaceId',
				type: 'string',
				default: '',
				description:
					'Filter tickets by workspace. Only returns tickets belonging to the specified workspace ID.',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Executor ID',
				name: 'filterExecutorId',
				type: 'string',
				default: '',
				description:
					'Filter tickets by the assigned executor. Only returns tickets assigned to the specified user ID.',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Requester ID',
				name: 'filterRequesterId',
				type: 'string',
				default: '',
				description:
					'Filter tickets by requester. Only returns tickets belonging to the specified requester ID.',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Ticket Type',
				name: 'filterTicketType',
				type: 'multiOptions',
				default: [],
				description:
					'Filter tickets by their type. Select one or more types: Request, Question, Bug Fix, Quote, Improvement. Multiple selections are combined with OR logic.',
				options: [
					{
						name: 'Request',
						value: '1',
						description: 'New feature request',
					},
					{
						name: 'Question',
						value: '2',
						description: 'Inquiry or clarification needed',
					},
					{
						name: 'Bug Fix',
						value: '3',
						description: 'Defect or error report',
					},
					{
						name: 'Quote',
						value: '4',
						description: 'Pricing or proposal request',
					},
					{
						name: 'Improvement',
						value: '5',
						description: 'Feature improvement suggestion',
					},
				],
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Status',
				name: 'filterStatus',
				type: 'multiOptions',
				default: [],
				description:
					'Filter tickets by their current status. Select one or more statuses: Processing (in progress), Awaiting Requester (waiting for response), Resolved (completed), Canceled (cancelled). Multiple selections are combined with OR logic.',
				options: [
					{
						name: 'Processing',
						value: '1',
						description: 'Tickets currently in progress',
					},
					{
						name: 'Awaiting Requester',
						value: '2',
						description: 'Tickets awaiting requester response',
					},
					{
						name: 'Resolved',
						value: '3',
						description: 'Tickets that have been completed',
					},
					{
						name: 'Canceled',
						value: '9',
						description: 'Tickets that were cancelled',
					},
				],
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Phase ID',
				name: 'filterPhaseId',
				type: 'string',
				default: '',
				description:
					'Filter tickets by phase. Only returns tickets belonging to the specified phase ID.',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Start Date',
				name: 'filterStartDate',
				type: 'dateTime',
				default: '',
				description:
					'Filter tickets from this date onwards. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-01-01).',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'End Date',
				name: 'filterEndDate',
				type: 'dateTime',
				default: '',
				description:
					'Filter tickets until this date. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-12-31).',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Concluded Date Start',
				name: 'filterConcludedDateStart',
				type: 'dateTime',
				default: '',
				description:
					'Filter tickets from this date onwards. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-01-01).',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			{
				displayName: 'Concluded Date End',
				name: 'filterConcludedDateEnd',
				type: 'dateTime',
				default: '',
				description:
					'Filter tickets until this date. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-12-31).',
				displayOptions: {
					show: {
						operation: ['getManyTickets'],
					},
				},
			},
			// Board fields
			{
				displayName: 'Title',
				name: 'boardTitle',
				type: 'string',
				required: true,
				default: '',
				description:
					'The title of the board. Boards are visual containers for organizing notes, ideas, and planning content.',
				displayOptions: {
					show: {
						operation: ['createBoard'],
					},
				},
			},
			// Note fields
			{
				displayName: 'Board ID',
				name: 'planId',
				type: 'number',
				required: true,
				default: null,
				description:
					'The numeric ID of the board where the note will be created. Each board can contain multiple notes organized by category.',
				displayOptions: {
					show: {
						operation: ['createNote'],
					},
				},
			},
			{
				displayName: 'Title',
				name: 'noteTitle',
				type: 'string',
				required: true,
				default: '',
				description:
					'The title of the note. Should be descriptive and help identify the note content at a glance.',
				displayOptions: {
					show: {
						operation: ['createNote'],
					},
				},
			},
			{
				displayName: 'Content',
				name: 'noteContent',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description:
					'The main content body of the note. This is where the detailed information, documentation, or ideas should be written.',
				displayOptions: {
					show: {
						operation: ['createNote'],
					},
				},
			},
			{
				displayName: 'Category',
				name: 'category',
				type: 'string',
				required: true,
				default: '',
				description:
					'The category to classify this note. Categories help organize notes within a board (e.g., "Ideas", "Meeting Notes", "Requirements", "Research").',
				displayOptions: {
					show: {
						operation: ['createNote'],
					},
				},
			},
			// Workspace fields
			{
				displayName: 'Name',
				name: 'workspaceName',
				type: 'string',
				required: true,
				default: '',
				description:
					'The name of the workspace. Workspaces are top-level containers that organize all work for a team, department, or business unit.',
				displayOptions: {
					show: {
						operation: ['createWorkspace'],
					},
				},
			},
			{
				displayName: 'Squad ID',
				name: 'squadId',
				type: 'number',
				default: null,
				description: 'Optional squad ID to associate with this workspace',
				displayOptions: {
					show: {
						operation: ['createWorkspace'],
					},
				},
			},
			{
				displayName: 'File',
				name: 'fileBinary',
				type: 'string',
				default: '',
				description: 'File to be attached to a ticket',
				displayOptions: {
					show: {
						operation: ['addArtifact'],
					},
				},
			},
			{
				displayName: 'Artifact IDs',
				name: 'artifactIds',
				type: 'collection',
				placeholder: 'Add IDs',
				description: 'List of numeric artifact IDs',
				displayOptions: {
					show: {
						operation: ['createTask', 'createTicket'],
					},
				},
				default: null,
				options: [
					{
						displayName: 'IDs',
						name: 'ids',
						type: 'number',
						default: 0,
						description: 'The numeric IDs of the artifacts to attach',
						typeOptions: {
							multipleValues: true,
						},
					},
				],
			},
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				required: true,
				default: '',
				description: 'The unique numeric identifier of the person to retrieve. You can find this ID in the person URL or by listing persons first.',
				displayOptions: {
					show: {
						operation: ['getPerson'],
					},
				},
			},
			{
				displayName: 'Person Name',
				name: 'personNameFilter',
				type: 'string',
				default: '',
				description: 'The name of the person to retrieve',
				displayOptions: {
					show: {
						operation: ['getManyPersons'],
					},
				},
			},
			{
				displayName: 'Person Type',
				name: 'personTypeFilter',
				type: 'options',
				default: '',
				description: 'The type of the person',
				options: [
					{
						name: 'Any',
						value: '',
					},
					{
						name: 'Individual',
						value: '10',
					},
					{
						name: 'Legal Entity',
						value: '20',
					}
				],
				displayOptions: {
					show: {
						operation: ['getManyPersons'],
					},
				},
			},
			{
				displayName: 'Person Profile',
				name: 'personProfile',
				type: 'options',
				default: '',
				description: 'The profile of the person to retrieve',
				options: [
					{
						name: 'Any',
						value: ''
					},
					{
						name: 'Customer',
						value: '10',
					},
					{
						name: 'Supplier',
						value: '20',
					},
					{
						name: 'Vehicle',
						value: '30',
					}
				],
				displayOptions: {
					show: {
						operation: ['getManyPersons'],
					},
				},
			},
			{
				displayName: 'Person ID',
				name: 'personId',
				type: 'string',
				required: true,
				default: '',
				description: 'The unique identifier of the person to associate this record with',
				displayOptions: {
					show: {
						operation: ['createPersonContact', 'createPersonAddress', 'createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				required: true,
				default: '',
				description: 'The full name of the person or contact',
				displayOptions: {
					show: {
						operation: ['createPerson', 'createPersonContact'],
					},
				},
			},
			{
				displayName: 'Alias',
				name: 'personAlias',
				type: 'string',
				default: '',
				description: 'A short name or nickname for the person',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Born At',
				name: 'personBornAt',
				type: 'dateTime',
				default: '',
				description: 'The date of birth of the person in ISO 8601 format',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Person Document',
				name: 'personDocument',
				type: 'string',
				default: '',
				description: 'The document of the person',
				displayOptions: {
					show: {
						operation: ['getManyPersons', 'createPerson'],
					},
				},
			},
			{
				displayName: 'Person Type',
				name: 'personType',
				type: 'options',
				required: true,
				default: '10',
				description: 'The type of the person',
				options: [
					{
						name: 'Individual',
						value: '10',
					},
					{
						name: 'Legal Entity',
						value: '20',
					}
				],
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'ID Card Number',
				name: 'personIdCardNumber',
				type: 'string',
				default: '',
				description: 'The identity card number (RG) of the person',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'State Registration',
				name: 'personStateRegistration',
				type: 'string',
				default: '',
				description: 'The state registration number (Inscrição Estadual) for legal entities',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'State Registration Optional',
				name: 'personStateRegistrationOptional',
				type: 'boolean',
				default: false,
				description: 'Whether the state registration is optional for this person',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Municipal Registration',
				name: 'personMunicipalRegistration',
				type: 'string',
				default: '',
				description: 'The municipal registration number (Inscrição Municipal) for legal entities',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Vehicle',
				name: 'personIsVehicle',
				type: 'boolean',
				default: false,
				description: 'Whether this person is classified as a media vehicle',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Supplier',
				name: 'personIsSupplier',
				type: 'boolean',
				default: false,
				description: 'Whether this person is classified as a supplier',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Customer',
				name: 'personIsCustomer',
				type: 'boolean',
				default: false,
				description: 'Whether this person is classified as a customer',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Person Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'The primary email address of the person',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Site',
				name: 'personSite',
				type: 'string',
				default: '',
				description: 'The website URL of the person or company',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Phone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'The phone number with country code (e.g., +5511999999999)',
				displayOptions: {
					show: {
						operation: ['createPerson', 'createPersonContact', 'createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Notes',
				name: 'notes',
				type: 'string',
				default: '',
				description: 'Additional notes or observations about this record',
				displayOptions: {
					show: {
						operation: ['createPerson', 'createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Avatar ID',
				name: 'personAvatarId',
				type: 'string',
				default: '',
				description: 'The ID of the avatar image to associate with this person',
				displayOptions: {
					show: {
						operation: ['createPerson'],
					},
				},
			},
			{
				displayName: 'Tag IDs',
				name: 'tagIds',
				type: 'collection',
				placeholder: 'Add Tag IDs',
				description: 'List of tag IDs to associate with the person or contact',
				displayOptions: {
					show: {
						operation: ['createPerson', 'createPersonContact'],
					},
				},
				default: null,
				options: [
					{
						displayName: 'IDs',
						name: 'ids',
						type: 'number',
						default: 0,
						description: 'The numeric IDs of the tags to associate',
						typeOptions: {
							multipleValues: true,
						},
					},
				],
			},
			{
				displayName: 'Is Main',
				name: 'isMain',
				type: 'boolean',
				default: false,
				description: 'Whether this is the primary record for the person',
				displayOptions: {
					show: {
						operation: ['createPersonAddress', 'createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Contact Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'The email address of the contact',
				displayOptions: {
					show: {
						operation: ['createPersonContact'],
					},
				},
			},
			{
				displayName: 'Is Charge',
				name: 'addressIsCharge',
				type: 'boolean',
				default: false,
				description: 'Whether this address is used for billing purposes',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Is Correspondence',
				name: 'addressIsCorrespondence',
				type: 'boolean',
				default: false,
				description: 'Whether this address is used for correspondence',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Zip Code',
				name: 'addressZipCode',
				type: 'string',
				default: '',
				description: 'The postal/zip code of the address',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Address',
				name: 'addressDescription',
				type: 'string',
				default: '',
				description: 'The street name and address line',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'District',
				name: 'addressDistrict',
				type: 'string',
				default: '',
				description: 'The neighborhood or district of the address',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Number',
				name: 'addressNumber',
				type: 'number',
				default: undefined,
				description: 'The street number of the address',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'No Number',
				name: 'addressNoNumber',
				type: 'boolean',
				default: false,
				description: 'Whether the address has no street number',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Complement',
				name: 'addressComplement',
				type: 'string',
				default: '',
				description: 'Additional address details such as apartment, suite, or floor number',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Address Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'The email address associated with this address',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'City ID',
				name: 'addressCityId',
				type: 'string',
				default: '',
				description: 'The unique identifier of the city',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'State ID',
				name: 'addressStateId',
				type: 'string',
				default: '',
				description: 'The unique identifier of the state',
				displayOptions: {
					show: {
						operation: ['createPersonAddress'],
					},
				},
			},
			{
				displayName: 'Bank',
				name: 'bankName',
				type: 'string',
				default: '',
				description: 'The name of the bank institution',
				displayOptions: {
					show: {
						operation: ['createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Account Type',
				name: 'bankAccountType',
				type: 'string',
				default: '',
				description: 'The type of the bank account (e.g., checking, savings)',
				displayOptions: {
					show: {
						operation: ['createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Bank Agency',
				name: 'bankAgency',
				type: 'string',
				default: '',
				description: 'The bank branch/agency number',
				displayOptions: {
					show: {
						operation: ['createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Account Number',
				name: 'bankAccountNumber',
				type: 'string',
				default: '',
				description: 'The bank account number',
				displayOptions: {
					show: {
						operation: ['createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Bank Notes',
				name: 'bankNotes',
				type: 'string',
				default: '',
				description: 'Additional notes about the bank account',
				displayOptions: {
					show: {
						operation: ['createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Pix Key',
				name: 'bankPixKey',
				type: 'string',
				default: '',
				description: 'The Pix key for instant payments (CPF, email, phone, or random key)',
				displayOptions: {
					show: {
						operation: ['createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Pix Description',
				name: 'bankPixDescription',
				type: 'string',
				default: '',
				description: 'A description or label for the Pix key',
				displayOptions: {
					show: {
						operation: ['createPersonBankData'],
					},
				},
			},
			{
				displayName: 'Form Name',
				name: 'formName',
				type: 'string',
				default: '',
				description: 'Filter task forms by name (partial match)',
				displayOptions: {
					show: {
						operation: ['getManyTaskForms'],
					},
				},
			},
			{
				displayName: 'Form ID',
				name: 'formId',
				type: 'string',
				default: '',
				description: 'Filter by specific form ID',
				displayOptions: {
					show: {
						operation: ['getManyTaskForms'],
					},
				},
			},
			{
				displayName: 'Form Type',
				name: 'formType',
				type: 'options',
				default: '',
				description: 'The type of the form to retrieve',
				options: [
					{
						name: 'Album',
						value: '100'
					},
					{
						name: 'Any',
						value: ''
					},
					{
						name: 'Banner',
						value: '70'
					},
					{
						name: 'Briefing',
						value: '10'
					},
					{
						name: 'Campaign',
						value: '20'
					},
					{
						name: 'Carousel',
						value: '50'
					},
					{
						name: 'Display',
						value: '30'
					},
					{
						name: 'Google Discovery',
						value: '90'
					},
					{
						name: 'Search',
						value: '40'
					},
					{
						name: 'Stories',
						value: '60'
					},
					{
						name: 'Video',
						value: '80'
					}
				],
				displayOptions: {
					show: {
						operation: ['getManyTaskForms'],
					},
				},
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const operation = this.getNodeParameter('operation', 0) as string;

		const RATE_LIMIT_MINUTES = 5;

		// Apply rate limit only to read operations (operations starting with "get")
		if (operation.startsWith('get')) {
			const staticData = this.getWorkflowStaticData('node');
			const rateLimitKey = `lastCall_${operation}`;
			const lastCallTime = staticData[rateLimitKey] as number;

			if (lastCallTime) {
				const now = Date.now();
				const timeDiffMs = now - lastCallTime;
				const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));

				if (timeDiffMinutes < RATE_LIMIT_MINUTES) {
					const remainingMinutes = RATE_LIMIT_MINUTES - timeDiffMinutes;
					const remainingSeconds =
						remainingMinutes * 60 - Math.floor((timeDiffMs % (1000 * 60)) / 1000);
					throw new NodeOperationError(
						this.getNode(),
						`Minimum interval of ${RATE_LIMIT_MINUTES} minutes not respected for GET operation "${operation}". Try again in ${remainingSeconds} seconds.`,
					);
				}
			}
		}

		const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
		let userEmail = '';
		let initialExecutor = '';

		// Helper function to register timestamp for read operations
		const registerTimestamp = () => {
			const staticData = this.getWorkflowStaticData('node');
			staticData[`lastCall_${operation}`] = Date.now();
		};

		try {
			let returnData: INodeExecutionData[] = [];
			let result: any;
			let endpoint = '';
			let headers: any = {
				'Content-Type': 'application/json',
			};
			let requestBody: any = {};

			switch (operation) {
				case 'createTask':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/tasks`;
					const ctcTaskTypeId = this.getNodeParameter('ctcTaskTypeId', 0) as number;
					const taskWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
					const quantity = this.getNodeParameter('quantity', 0) as number;
					const ctcTaskProjectId = this.getNodeParameter('ctcTaskProjectId', 0) as number;
					const taskArtifactCollection = this.getNodeParameter('artifactIds', 0) as {
						ids: number[];
					};
					const taskArtifactIds = taskArtifactCollection.ids;
					initialExecutor = this.getNodeParameter('initialExecutor', 0) as string;
					requestBody = {
						UserEmail: userEmail,
						Title: this.getNodeParameter('title', 0) as string,
						...(ctcTaskTypeId && { CtcTaskTypeId: ctcTaskTypeId }),
						...(taskWorkspaceId && { WorkspaceId: taskWorkspaceId }),
						PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
						...(quantity && { Quantity: quantity }),
						...(ctcTaskProjectId && { CtcTaskProjectId: ctcTaskProjectId }),
						Description: this.getNodeParameter('taskDescription', 0) as string,
						PhaseStartDate: this.getNodeParameter('phaseStartDate', 0) as string,
						CurrentDueDate: this.getNodeParameter('currentDueDate', 0) as string,
						EstimatedTime: this.getNodeParameter('estimatedTime', 0) as number,
						PlanTask: this.getNodeParameter('planTask', 0) as boolean,
						InitialExecutor: initialExecutor,
						Artifacts: taskArtifactIds,
					};
					break;

				case 'createProject':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/projects`;
					const projectWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
					const sourceProjectId = this.getNodeParameter('sourceProjectId', 0) as number;
					requestBody = {
						Name: this.getNodeParameter('projectName', 0) as string,
						Alias: this.getNodeParameter('alias', 0) as string,
						Description: this.getNodeParameter('projectDescription', 0) as string,
						...(projectWorkspaceId && { WorkspaceId: projectWorkspaceId }),
						...(sourceProjectId && { sourceProjectId }),
						Tags: this.getNodeParameter('tags', 0) as string,
						StartDate: this.getNodeParameter('startDate', 0) as string,
					};
					break;

				case 'createTicket':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/tickets`;
					const ticketWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
					const ticketType = parseInt(this.getNodeParameter('ticketType', 0) as string, 10);
					const artifactCollection = this.getNodeParameter('artifactIds', 0) as { ids: number[] };
					const artifactIds = artifactCollection.ids;
					requestBody = {
						UserEmail: userEmail,
						Subject: this.getNodeParameter('subject', 0) as string,
						...(ticketWorkspaceId && { WorkspaceId: ticketWorkspaceId }),
						...(ticketType && { TicketType: ticketType }),
						ExpectDueDate: this.getNodeParameter('expectDueDate', 0) as string,
						PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
						RequesterEmail: this.getNodeParameter('requesterEmail', 0) as string,
						UsersCC: this.getNodeParameter('usersCC', 0) as string,
						AnalystEmail: this.getNodeParameter('analystEmail', 0) as string,
						Message: this.getNodeParameter('ticketMessage', 0) as string,
						Artifacts: artifactIds,
					};
					break;

				case 'addArtifact':
					endpoint = `${baseUrl}/artifacts`;
					headers = {};
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					const workspaceId = this.getNodeParameter('workspaceId', 0) as number;
					const fileProperty = this.getNodeParameter('fileBinary', 0) as string;
					const binaryData = await this.helpers.getBinaryDataBuffer(0, fileProperty);
					const item = this.getInputData()[0];
					const fileName = item.binary?.[fileProperty]?.fileName;
					const mimeType = item.binary?.[fileProperty]?.mimeType;
					const formData = new FormData();
					formData.append('WorkspaceId', workspaceId.toString());
					formData.append('UserEmail', userEmail);
					formData.append('File', binaryData, {
						filename: fileName,
						contentType: mimeType,
					});
					requestBody = formData;
					break;

				case 'createBoard':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/boards`;
					const boardWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
					requestBody = {
						Title: this.getNodeParameter('boardTitle', 0) as string,
						Description: this.getNodeParameter('boardDescription', 0) as string,
						...(boardWorkspaceId && { WorkspaceId: boardWorkspaceId }),
					};
					break;

				case 'createWorkspace':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/workspaces`;
					const squadId = this.getNodeParameter('squadId', 0) as number;
					requestBody = {
						Name: this.getNodeParameter('workspaceName', 0) as string,
						Description: this.getNodeParameter('workspaceDescription', 0) as string,
						...(squadId && { SquadId: squadId }),
					};
					break;

				case 'createNote':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/notes`;
					const planId = this.getNodeParameter('planId', 0) as number;
					requestBody = {
						...(planId && { PlanId: planId }),
						Title: this.getNodeParameter('noteTitle', 0) as string,
						Description: this.getNodeParameter('noteDescription', 0) as string,
						Content: this.getNodeParameter('noteContent', 0) as string,
						Category: this.getNodeParameter('category', 0) as string,
					};
					break;

				case 'createPerson':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/persons`;

					const tagCollection = this.getNodeParameter('tagIds', 0) as { ids: number[] };
					const tagIds = tagCollection?.ids ?? [];
					const tagsFormatted = tagIds.map(id => ({
						Id: id.toString(),
					}));

					requestBody = {
						UserEmail: userEmail,
						Name: this.getNodeParameter('name', 0) as string,
						Alias: this.getNodeParameter('personAlias', 0) as string,
						BornAt: this.getNodeParameter('personBornAt', 0) as string,
						Type: this.getNodeParameter('personType', 0) as string,
						Document: this.getNodeParameter('personDocument', 0) as string,
						IdCardNumber: this.getNodeParameter('personIdCardNumber', 0) as string,
						StateRegistration: this.getNodeParameter('personStateRegistration', 0) as string,
						StateRegistrationOptional: this.getNodeParameter('personStateRegistrationOptional', 0) as boolean,
						MunicipalRegistration: this.getNodeParameter('personMunicipalRegistration', 0) as string,
						IsVehicle: this.getNodeParameter('personIsVehicle', 0) as boolean,
						IsSupplier: this.getNodeParameter('personIsSupplier', 0) as boolean,
						IsCustomer: this.getNodeParameter('personIsCustomer', 0) as boolean,
						Email: this.getNodeParameter('email', 0) as string,
						Site: this.getNodeParameter('personSite', 0) as string,
						Phone: this.getNodeParameter('phone', 0) as string,
						Notes: this.getNodeParameter('notes', 0) as string,
						AvatarId: this.getNodeParameter('personAvatarId', 0) as string,
						Tags: tagsFormatted
					};
					break;

				case 'createPersonContact':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/persons/contacts`;

					const contactTagCollection = this.getNodeParameter('tagIds', 0) as { ids: number[] };
					const contactTagIds = contactTagCollection?.ids ?? [];
					 const contactTagsFormatted = contactTagIds.map(id => ({
						Id: id.toString(),
					}));

					requestBody = {
						UserEmail: userEmail,
						PersonId: this.getNodeParameter('personId', 0) as string,
						Name: this.getNodeParameter('name', 0) as string,
						Email: this.getNodeParameter('email', 0) as string,
						Phone: this.getNodeParameter('phone', 0) as string,
						Tags: contactTagsFormatted
					};
					break;

				case 'createPersonAddress':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/persons/addresses`;

					const addressNumber = this.getNodeParameter('addressNumber', 0, null);

					requestBody = {
						UserEmail: userEmail,
						PersonId: this.getNodeParameter('personId', 0) as string,
						IsMain: this.getNodeParameter('isMain', 0) as boolean,
						IsCharge: this.getNodeParameter('addressIsCharge', 0) as boolean,
						IsCorrespondence: this.getNodeParameter('addressIsCorrespondence', 0) as boolean,
						Name: this.getNodeParameter('addressDescription', 0) as string,
						ZipCode: this.getNodeParameter('addressZipCode', 0) as string,
						...(addressNumber && { Number: addressNumber }),
						District: this.getNodeParameter('addressDistrict', 0) as string,
						NoNumber: this.getNodeParameter('addressNoNumber', 0) as boolean,
						Complement: this.getNodeParameter('addressComplement', 0) as string,
						Email: this.getNodeParameter('email', 0) as string,
						Phone: this.getNodeParameter('phone', 0) as string,
						Notes: this.getNodeParameter('notes', 0) as string,
						CityId: this.getNodeParameter('addressCityId', 0) as string,
						StateId: this.getNodeParameter('addressStateId', 0) as string,
					};
					break;

				case 'createPersonBankData':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/persons/bank-data`;

					requestBody = {
						UserEmail: userEmail,
						PersonId: this.getNodeParameter('personId', 0) as string,
						Bank: this.getNodeParameter('bankName', 0) as string,
						AccountType: this.getNodeParameter('bankAccountType', 0) as string,
						BankAgency: this.getNodeParameter('bankAgency', 0) as string,
						AccountNumber: this.getNodeParameter('bankAccountNumber', 0) as string,
						BankNotes: this.getNodeParameter('bankNotes', 0) as string,
						PixKey: this.getNodeParameter('bankPixKey', 0) as string,
						PixDescription: this.getNodeParameter('bankPixDescription', 0) as string,
						IsMain: this.getNodeParameter('isMain', 0) as boolean,
					};
					break;

				case 'getNotifications':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/polling/notifications`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						qs: { UserEmail: userEmail },
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const notifications =
						typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = notifications.map((notification: any, i: number) => ({
						json: notification,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getBoards':
					endpoint = `${baseUrl}/polling/boards`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const boards = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = boards.map((board: any, i: number) => ({
						json: board,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getWorkspaces':
					endpoint = `${baseUrl}/polling/workspaces`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const workspaces =
						typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = workspaces.map((workspace: { id: number; name: string }, i: number) => ({
						json: workspace,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getProjects':
					endpoint = `${baseUrl}/polling/projects/created`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const projects = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = projects.map((project: any, i: number) => ({
						json: project,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getTasks':
					endpoint = `${baseUrl}/polling/tasks`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const tasks = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = tasks.map((task: any, i: number) => ({
						json: task,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getTasksPhase':
					endpoint = `${baseUrl}/polling/v2/tasks`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const tasksPhase =
						typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = tasksPhase.map((task: any, i: number) => ({
						json: task,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getTask':
					const taskId = this.getNodeParameter('taskId', 0) as string;
					endpoint = `${baseUrl}/polling/v3/task/${taskId}`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const task = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = [
						{
							json: task,
							pairedItem: { item: 0 },
						},
					];
					registerTimestamp();
					return [returnData];

				case 'getManyTasks':
					endpoint = `${baseUrl}/polling/v3/tasks`;
					// Build query string parameters for filters
					const queryParams: Record<string, string> = {};

					const filterTitle = this.getNodeParameter('filterTitle', 0) as string;
					if (filterTitle) {
						queryParams.Title = filterTitle;
					}

					const filterSituation = resolveMultiOptions(this.getNodeParameter('filterSituation', 0));
					if (filterSituation) {
						queryParams.TaskSituation = filterSituation;
					}

					const filterWorkspaceId = this.getNodeParameter('filterWorkspaceId', 0) as string;
					if (filterWorkspaceId) {
						queryParams.WorkspaceId = filterWorkspaceId;
					}

					const filterExecutorId = this.getNodeParameter('filterExecutorId', 0) as string;
					if (filterExecutorId) {
						queryParams.ExecutorId = filterExecutorId;
					}

					const filterSquadId = this.getNodeParameter('filterSquadId', 0) as string;
					if (filterSquadId) {
						queryParams.SquadId = filterSquadId;
					}

					const filterProjectId = this.getNodeParameter('filterProjectId', 0) as string;
					if (filterProjectId) {
						queryParams.ProjectId = filterProjectId;
					}

					const filterStartDate = this.getNodeParameter('filterStartDate', 0) as string;
					if (filterStartDate) {
						queryParams.StartDate = filterStartDate;
					}

					const filterEndDate = this.getNodeParameter('filterEndDate', 0) as string;
					if (filterEndDate) {
						queryParams.EndDate = filterEndDate;
					}

					const filterPeriod = this.getNodeParameter('filterPeriod', 0) as string;
					if (filterPeriod) {
						queryParams.Period = filterPeriod;
					}

					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						qs: queryParams,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const manyTasks = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = manyTasks.map((taskItem: any, i: number) => ({
						json: taskItem,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getManyTickets': {
					endpoint = `${baseUrl}/polling/tickets`;

					const queryParams: Record<string, string> = {};

					const companyId = this.getNodeParameter('filterCompanyId', 0) as string;
					if (companyId) {
						queryParams.CompanyId = companyId;
					}

					const filterWorkspaceId = this.getNodeParameter('filterWorkspaceId', 0) as string;
					if (filterWorkspaceId) {
						queryParams.WorkspaceId = filterWorkspaceId;
					}

					const filterExecutorId = this.getNodeParameter('filterExecutorId', 0) as string;
					if (filterExecutorId) {
						queryParams.ExecutorId = filterExecutorId;
					}

					const filterRequesterId = this.getNodeParameter('filterRequesterId', 0) as string;
					if (filterRequesterId) {
						queryParams.RequesterId = filterRequesterId;
					}

					const filterStatus = resolveMultiOptions(this.getNodeParameter('filterStatus', 0));
					if (filterStatus) {
						queryParams.TaskSituation = filterStatus;
					}

					const filterTicketType = resolveMultiOptions(
						this.getNodeParameter('filterTicketType', 0),
					);
					if (filterTicketType) {
						queryParams.TicketType = filterTicketType;
					}

					const filterPhaseId = this.getNodeParameter('filterPhaseId', 0) as string;
					if (filterPhaseId) {
						queryParams.PhaseId = filterPhaseId;
					}

					const filterStartDate = this.getNodeParameter('filterStartDate', 0) as string;
					if (filterStartDate) {
						queryParams.StartDate = filterStartDate;
					}

					const filterEndDate = this.getNodeParameter('filterEndDate', 0) as string;
					if (filterEndDate) {
						queryParams.EndDate = filterEndDate;
					}

					const filterConcludedDateStart = this.getNodeParameter(
						'filterConcludedDateStart',
						0,
					) as string;
					if (filterConcludedDateStart) {
						queryParams.ConcludedDateStart = filterConcludedDateStart;
					}

					const filterConcludedDateEnd = this.getNodeParameter(
						'filterConcludedDateEnd',
						0,
					) as string;
					if (filterConcludedDateEnd) {
						queryParams.ConcludedDateEnd = filterConcludedDateEnd;
					}

					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						qs: queryParams,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					
					//Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const manyTasks = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = manyTasks.map((taskItem: any, i: number) => ({
						json: taskItem,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];
					break;
				}

				case 'getTicketsChanged':
					endpoint = `${baseUrl}/polling/tickets/changes`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const ticketsChanged =
						typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = ticketsChanged.map((ticket: any, i: number) => ({
						json: ticket,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getTicketsClosed':
					endpoint = `${baseUrl}/polling/tickets/concluded`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					// Check for errors
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const ticketsClosed =
						typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = ticketsClosed.map((ticket: any, i: number) => ({
						json: ticket,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

				case 'getPerson':
					const personId = this.getNodeParameter('personId', 0) as string;
					endpoint = `${baseUrl}/polling/persons/${personId}`;
					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});

					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const person = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = [
						{
							json: person,
							pairedItem: { item: 0 },
						},
					];
					registerTimestamp();
					return [returnData];

				case 'getManyPersons':
					endpoint = `${baseUrl}/polling/persons`;
					const queryPersonParams: Record<string, string> = {};

					const filterPersonName = this.getNodeParameter('personNameFilter', 0) as string;
					const filterPersonDocument = this.getNodeParameter('personDocument', 0) as string;
					const filterPersonType = this.getNodeParameter('personTypeFilter', 0) as string;
					const filterPersonProfileId = this.getNodeParameter('personProfile', 0) as string;

					if (filterPersonName) {
						queryPersonParams.Name = filterPersonName;
					}

					if (filterPersonDocument) {
						queryPersonParams.Document = filterPersonDocument;
					}

					if (filterPersonType) {
						queryPersonParams.PersonType = filterPersonType;
					}

					if (filterPersonProfileId) {
						queryPersonParams.ProfileId = filterPersonProfileId;
					}

					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						qs: queryPersonParams,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const persons = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = [
						{
							json: persons,
							pairedItem: { item: 0 },
						},
					];
					registerTimestamp();
					return [returnData];
				
				case 'getManyTaskForms':
					endpoint = `${baseUrl}/polling/task-forms`;
					const queryTaskFormParams: Record<string, string> = {};

					const filterTaskId = this.getNodeParameter('taskId', 0) as string;
					const filterFormName = this.getNodeParameter('formName', 0) as string;
					const filterTaskFormId = this.getNodeParameter('formId', 0) as string;
					const filterFormType = this.getNodeParameter('formType', 0) as string;
					
					queryTaskFormParams.CtcTaskId = filterTaskId
					
					if (filterFormName) {
						queryTaskFormParams.FormName = filterFormName;
					}

					if (filterTaskFormId) {
						queryTaskFormParams.FormId = filterTaskFormId;
					}

					if (filterFormType) {
						queryTaskFormParams.FormType = filterFormType;
					}

					result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
						method: 'GET',
						url: endpoint,
						qs: queryTaskFormParams,
						returnFullResponse: true,
						ignoreHttpStatusErrors: true,
					});
					if (result.statusCode && result.statusCode >= 400) {
						let errorMessage = `Error executing operation ${operation}`;
						try {
							const errorBody =
								typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
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
						throw new NodeOperationError(this.getNode(), errorMessage);
					}
					const taskForms = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = [
						{
							json: taskForms,
							pairedItem: { item: 0 },
						},
					];
					registerTimestamp();
					return [returnData];
				

				default:
					throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
			}

			result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
				method: 'POST',
				url: endpoint,
				qs: {
					UserEmail: userEmail,
				},
				body: requestBody,
				headers: headers,
				returnFullResponse: true,
				ignoreHttpStatusErrors: true,
			});

			// Check if the request was successful
			if (result.statusCode && result.statusCode >= 400) {
				let errorMessage = `Error executing operation ${operation}`;

				try {
					const errorBody = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

					if (errorBody && errorBody.text) {
						errorMessage = errorBody.text;
						if (errorBody.id) {
							errorMessage = `[Error ${errorBody.id}] ${errorBody.text}`;
						}
					} else if (errorBody && errorBody.message) {
						errorMessage = errorBody.message;
					}
				} catch (parseError) {
					// If parsing fails, use status message
					errorMessage = `Error ${result.statusCode}: ${result.statusMessage || 'Request failed'}`;
				}

				throw new NodeOperationError(this.getNode(), errorMessage);
			}

			// Process successful response
			const parsedResult = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
			returnData = [
				{
					json: parsedResult,
					pairedItem: { item: 0 },
				},
			];

			return [returnData];
		} catch (error: any) {
			// Re-throw if it's already a NodeOperationError
			if (error instanceof NodeOperationError) {
				throw error;
			}
			// For any other errors (network, etc.)
			throw new NodeOperationError(
				this.getNode(),
				`Error executing operation ${operation}: ${error.message || 'Unknown error'}`,
			);
		}
	}
}
