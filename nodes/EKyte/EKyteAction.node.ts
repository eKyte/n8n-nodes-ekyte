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
    subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
    description: 'Create and retrieve data from eKyte (tasks, projects, tickets, boards, workspaces, notes, notifications)',
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
            description: 'Create a new eKyte Board',
            action: 'Create board',
          },
          {
            name: 'Get All',
            value: 'getBoards',
            description: 'Get all boards from eKyte',
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
            description: 'Create a new eKyte Note',
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
            description: 'Create a new eKyte Project',
            action: 'Create project',
          },
          {
            name: 'Get All',
            value: 'getProjects',
            description: 'Get all created projects from eKyte',
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
            description: 'Create a new eKyte Task',
            action: 'Create task',
          },
          {
            name: 'Get All',
            value: 'getTasks',
            description: 'Get all tasks from eKyte',
            action: 'Get all tasks',
          },
          {
            name: 'Get All with Phase',
            value: 'getTasksPhase',
            description: 'Get all tasks with phase information from eKyte',
            action: 'Get all tasks with phase',
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
            description: 'Create a new eKyte Ticket',
            action: 'Create ticket',
          },
          {
            name: 'Get Changed',
            value: 'getTicketsChanged',
            description: 'Get tickets that have been updated in the last 15 minutes',
            action: 'Get changed tickets',
          },
          {
            name: 'Get Closed',
            value: 'getTicketsClosed',
            description: 'Get tickets that were closed in the last 15 minutes',
            action: 'Get closed tickets',
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
            description: 'Get all notifications from eKyte',
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
            description: 'Create a new eKyte Workspace',
            action: 'Create workspace',
          },
          {
            name: 'Get All',
            value: 'getWorkspaces',
            description: 'Get all workspaces from eKyte',
            action: 'Get all workspaces',
          },
        ],
        default: 'createWorkspace',
      },
      {
        displayName: 'Base URL',
        name: 'baseUrl',
        type: 'hidden',
        default: 'https://api.ekyte.com/n8n',
        description: 'The base URL for eKyte API',
      },
      {
        displayName: 'Email',
        name: 'userEmail',
        type: 'string',
        required: true,
        default: '',
        description: 'The user email for eKyte operations',
        displayOptions: {
          show: {
            operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'createNote', 'createWorkspace', 'getNotifications'],
          },
        },
      },
      // Task fields
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        required: true,
        default: '',
        description: 'Task title',
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
        displayOptions: {
          show: {
            operation: ['createTask'],
          },
        },
      },
      {
        displayName: 'Workspace ID',
        name: 'workspaceId',
        type: 'number',
        required: true,
        default: null,
        displayOptions: {
          show: {
            operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'createNote'],
          },
        },
      },
      {
        displayName: 'Priority',
        name: 'priorityGroup',
        type: 'number',
        required: true,
        default: 0,
        description: 'Priority group (0-100, where 0=Not prioritized, 1-25=Low, 26-50=Medium, 51-75=High, 76-100=Urgent)',
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
        displayOptions: {
          show: {
            operation: ['createTask'],
          },
        },
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'createNote', 'createWorkspace'],
          },
        },
      },
      {
        displayName: 'Start Date',
        name: 'phaseStartDate',
        type: 'dateTime',
        required: true,
        default: '',
        description: 'Task start date',
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
        description: 'Task due date',
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
        description: 'Estimated time in minutes',
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
      // Project fields
      {
        displayName: 'Title',
        name: 'projectName',
        type: 'string',
        required: true,
        default: '',
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
        description: 'Project start date',
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
        displayOptions: {
          show: {
            operation: ['createTicket'],
          },
        },
      },
      {
        displayName: 'Ticket Type',
        name: 'ticketType',
        type: 'number',
        required: true,
        default: null,
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
        displayOptions: {
          show: {
            operation: ['createTicket'],
          },
        },
      },
      {
        displayName: 'Description',
        name: 'message',
        type: 'string',
        default: '',
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
        description: 'Board/Plan ID where the note will be created',
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
        displayOptions: {
          show: {
            operation: ['createNote'],
          },
        },
      },
      {
        displayName: 'Content',
        name: 'content',
        type: 'string',
        default: '',
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
        description: 'Note category',
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
        displayOptions: {
          show: {
            operation: ['createWorkspace'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const operation = this.getNodeParameter('operation', 0) as string;

    const RATE_LIMIT_MINUTES = 15;
    const staticData = this.getWorkflowStaticData('node');
    const rateLimitKey = `lastCall_${operation}`;
    const lastCallTime = staticData[rateLimitKey] as number;

    if (lastCallTime) {
      const now = Date.now();
      const timeDiffMs = now - lastCallTime;
      const timeDiffMinutes = Math.floor(timeDiffMs / (1000 * 60));

      if (timeDiffMinutes < RATE_LIMIT_MINUTES) {
        const remainingMinutes = RATE_LIMIT_MINUTES - timeDiffMinutes;
        const remainingSeconds = (remainingMinutes * 60) - Math.floor((timeDiffMs % (1000 * 60)) / 1000);
        throw new NodeOperationError(
          this.getNode(),
          `Minimum interval of ${RATE_LIMIT_MINUTES} minutes not respected for operation "${operation}". Try again in ${remainingSeconds} seconds.`
        );
      }
    }

    const baseUrl = this.getNodeParameter('baseUrl', 0) as string;
    let userEmail = '';

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
          requestBody = {
            UserEmail: userEmail,
            Title: this.getNodeParameter('title', 0) as string,
            ...(ctcTaskTypeId && { CtcTaskTypeId: ctcTaskTypeId }),
            ...(taskWorkspaceId && { WorkspaceId: taskWorkspaceId }),
            PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
            ...(quantity && { Quantity: quantity }),
            ...(ctcTaskProjectId && { CtcTaskProjectId: ctcTaskProjectId }),
            Description: this.getNodeParameter('description', 0) as string,
            PhaseStartDate: this.getNodeParameter('phaseStartDate', 0) as string,
            CurrentDueDate: this.getNodeParameter('currentDueDate', 0) as string,
            EstimatedTime: this.getNodeParameter('estimatedTime', 0) as number,
            PlanTask: this.getNodeParameter('planTask', 0) as boolean,
          };
          break;

        case 'createProject':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
          endpoint = `${baseUrl}/projects`;
          const projectWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
          requestBody = {
            Name: this.getNodeParameter('projectName', 0) as string,
            Alias: this.getNodeParameter('alias', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            ...(projectWorkspaceId && { WorkspaceId: projectWorkspaceId }),
            Tags: this.getNodeParameter('tags', 0) as string,
            StartDate: this.getNodeParameter('startDate', 0) as string,
          };
          break;

        case 'createTicket':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
          endpoint = `${baseUrl}/tickets`;
          const ticketWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
          const ticketType = this.getNodeParameter('ticketType', 0) as number;
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
            Message: this.getNodeParameter('message', 0) as string,
          };
          break;

        case 'createBoard':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
          endpoint = `${baseUrl}/boards`;
          const boardWorkspaceId = this.getNodeParameter('workspaceId', 0) as number;
          requestBody = {
            Title: this.getNodeParameter('boardTitle', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            ...(boardWorkspaceId && { WorkspaceId: boardWorkspaceId }),
          };
          break;

        case 'createWorkspace':
					userEmail = this.getNodeParameter('userEmail', 0) as string;
          endpoint = `${baseUrl}/workspaces`;
          const squadId = this.getNodeParameter('squadId', 0) as number;
          requestBody = {
            Name: this.getNodeParameter('workspaceName', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
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
            Description: this.getNodeParameter('description', 0) as string,
            Content: this.getNodeParameter('content', 0) as string,
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
          });
          const notifications = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = notifications.map((notification: any, i: number) => ({
            json: notification,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getBoards':
          endpoint = `${baseUrl}/polling/boards`;
          result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
            method: 'GET',
            url: endpoint,
          });
          const boards = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = boards.map((board: any, i: number) => ({
            json: board,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getWorkspaces':
          endpoint = `${baseUrl}/polling/workspaces`;
          result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
            method: 'GET',
            url: endpoint,
          });
          const workspaces = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = workspaces.map((workspace: {id: number, name: string}, i: number) => ({
            json: workspace,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getProjects':
          endpoint = `${baseUrl}/polling/projects/created`;
          result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
            method: 'GET',
            url: endpoint,
          });
          const projects = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = projects.map((project: any, i: number) => ({
            json: project,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTasks':
          endpoint = `${baseUrl}/polling/tasks`;
          result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
            method: 'GET',
            url: endpoint,
          });
          const tasks = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = tasks.map((task: any, i: number) => ({
            json: task,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTasksPhase':
          endpoint = `${baseUrl}/polling/v2/tasks`;
          result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
            method: 'GET',
            url: endpoint,
          });
          const tasksPhase = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = tasksPhase.map((task: any, i: number) => ({
            json: task,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTicketsChanged':
          endpoint = `${baseUrl}/polling/tickets/concluded`;
          result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
            method: 'GET',
            url: endpoint,
          });
          const ticketsChanged = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = ticketsChanged.map((ticket: any, i: number) => ({
            json: ticket,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTicketsClosed':
          endpoint = `${baseUrl}/polling/tickets/changes`;
          result = await this.helpers.httpRequestWithAuthentication.call(this, 'eKyteApi', {
            method: 'GET',
            url: endpoint,
          });
          const ticketsClosed = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = ticketsClosed.map((ticket: any, i: number) => ({
            json: ticket,
            pairedItem: { item: i },
          }));
          staticData[rateLimitKey] = Date.now();
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
      });

      const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
      returnData = [{
        json: parsedResult,
        pairedItem: { item: 0 },
      }];

      staticData[rateLimitKey] = Date.now();

      return [returnData];
    } catch (error) {
      throw new NodeOperationError(this.getNode(), `Error executing operation ${operation}: ${(error as Error).message}`);
    }
  }
}