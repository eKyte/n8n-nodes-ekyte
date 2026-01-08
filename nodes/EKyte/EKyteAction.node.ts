import {
	IExecuteFunctions,
	INodeType,
	INodeTypeDescription,
	INodeExecutionData,
	NodeOperationError,
} from 'n8n-workflow';

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
						description: 'Search and filter tasks by title, status, workspace, executor, squad, project, or date range',
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
						description: 'Get tasks created or updated in the last 15 minutes including current phase/stage information',
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
						resource: ['ticket'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'createTicket',
						description: 'Create a new ticket with subject, type, priority, and requester information',
						action: 'Create ticket',
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
						name: 'Add',
						value: 'addArtifact',
						description: 'Add a new artifact to be attached on ticket',
						action: 'Add artifact',
					},
				],
				default: 'addArtifact',
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
							'createTask',
							'createProject',
							'createTicket',
							'createBoard',
							'createNote',
							'createWorkspace',
							'getNotifications',
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
				description: 'The unique numeric identifier of the task to retrieve. You can find this ID in the task URL or by listing tasks first.',
				displayOptions: {
					show: {
						operation: ['getTask'],
					},
				},
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				required: true,
				default: '',
				description: 'The title or name of the task. This should be a clear, concise description of what needs to be done.',
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
						operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'addArtifact'],
					},
				},
			},
			{
				displayName: 'Initial Executor',
				name: 'initialExecutor',
				type: 'string',
				default: '',
				description: 'The email address of the team member who will be assigned to execute this task',
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
				description: 'Optional project ID to associate this task with. Linking a task to a project helps organize related work and track project progress.',
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
				description: 'The date when work on this task should begin. Use ISO 8601 format (e.g., 2024-01-15). This date is used for scheduling and workload planning.',
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
				description: 'The deadline by which the task must be completed. Use ISO 8601 format (e.g., 2024-01-20). Tasks past their due date will be flagged as overdue.',
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
				description: 'The estimated effort required to complete this task, expressed in minutes. For example: 60 = 1 hour, 480 = 8 hours (1 day). Used for capacity planning and workload management.',
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
				description: 'Filter tasks by title. Returns tasks whose title contains this text (case-insensitive partial match).',
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
				description: 'Filter tasks by their current status. Select one or more situations: Active (in progress), Pause (temporarily stopped), Concluded (completed), Canceled (cancelled). Multiple selections are combined with OR logic.',
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
				description: 'Filter tasks by workspace. Only returns tasks belonging to the specified workspace ID.',
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
				description: 'Filter tasks by the assigned executor. Only returns tasks assigned to the specified user ID.',
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
				description: 'Filter tasks by squad. Only returns tasks belonging to the specified squad ID.',
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
				description: 'Filter tasks by project. Only returns tasks associated with the specified project ID.',
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
				description: 'Filter tasks from this date onwards. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-01-01).',
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
				description: 'Filter tasks until this date. Use with Period field to specify whether this applies to creation date or conclusion date. Format: ISO 8601 (e.g., 2024-12-31).',
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
				description: 'Defines which date field the Start Date and End Date filters apply to. Select Creation to filter by when tasks were created, or Conclusion to filter by when tasks were completed.',
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
				description: 'The name of the project. Choose a clear, descriptive name that identifies the project purpose and scope.',
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
				description: 'Comma-separated list of tags for categorizing and filtering the project (e.g., "marketing, Q1, high-priority")',
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
				description: 'The planned start date for the project. Use ISO 8601 format (e.g., 2024-01-15). Helps with project timeline planning and scheduling.',
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
				description: 'The subject line of the ticket. Should be a brief summary of the issue or request being reported.',
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
						name: 'Enhancement',
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
				description: 'The expected resolution date for this ticket. Use ISO 8601 format (e.g., 2024-01-20).',
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
				description: 'Detailed description of the ticket. Include all relevant information such as steps to reproduce, specific requirements, or context needed to address the request.',
				displayOptions: {
					show: {
						operation: ['createTicket'],
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
				description: 'The title of the board. Boards are visual containers for organizing notes, ideas, and planning content.',
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
				description: 'The numeric ID of the board where the note will be created. Each board can contain multiple notes organized by category.',
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
				description: 'The title of the note. Should be descriptive and help identify the note content at a glance.',
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
				description: 'The main content body of the note. This is where the detailed information, documentation, or ideas should be written.',
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
				description: 'The category to classify this note. Categories help organize notes within a board (e.g., "Ideas", "Meeting Notes", "Requirements", "Research").',
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
				description: 'The name of the workspace. Workspaces are top-level containers that organize all work for a team, department, or business unit.',
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
				default: null,
				description: 'File to be attached on ticket',
				displayOptions: {
					show: {
						operation: ['addArtifact'],
					},
				},
			},
			{
				displayName: 'Artifact IDs',
				name: 'artifactIds',
				type: 'multiOptions',
				options: [],
				default: [''],
				description: 'List of artifact numeric IDs',
				displayOptions: {
					show: {
						operation: ['createTicket'],
					},
				},
			},
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
			let requestBody: any = {};

			switch (operation) {
				case 'createTask':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/tasks`;
					const ctcTaskTypeId = this.getNodeParameter('ctcTaskTypeId', 0) as number;
					const taskWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
					const quantity = this.getNodeParameter('quantity', 0) as number;
					const ctcTaskProjectId = this.getNodeParameter('ctcTaskProjectId', 0) as number;
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
					};
					break;

				case 'createProject':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/projects`;
					const projectWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
					requestBody = {
						Name: this.getNodeParameter('projectName', 0) as string,
						Alias: this.getNodeParameter('alias', 0) as string,
						Description: this.getNodeParameter('projectDescription', 0) as string,
						...(projectWorkspaceId && { WorkspaceId: projectWorkspaceId }),
						Tags: this.getNodeParameter('tags', 0) as string,
						StartDate: this.getNodeParameter('startDate', 0) as string,
					};
					break;

				case 'createTicket':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
					endpoint = `${baseUrl}/tickets`;
					const ticketWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
					const ticketType = parseInt(this.getNodeParameter('ticketType', 0) as string, 10);
					const artifactIds = this.getNodeParameter('artifactIds', 0) as string[];
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
					requestBody = {
						 WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
						 File: this.getNodeParameter('fileBinary', 0) as string,
					};
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

					const filterSituation = this.getNodeParameter('filterSituation', 0) as string[];
					if (filterSituation && filterSituation.length > 0) {
						queryParams.TaskSituation = filterSituation.join(',');
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
					const manyTasks =
						typeof result.body === 'string' ? JSON.parse(result.body) : result.body;
					returnData = manyTasks.map((taskItem: any, i: number) => ({
						json: taskItem,
						pairedItem: { item: i },
					}));
					registerTimestamp();
					return [returnData];

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
				headers: {
					'Content-Type': 'application/json',
				},
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
