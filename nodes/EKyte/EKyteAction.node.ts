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
    subtitle: '={{$parameter["operation"]}}',
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
    requestDefaults: {
      baseURL: 'https://api.ekyte.com/n8n',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Create Board',
            value: 'createBoard',
            description: 'Create a new eKyte Board',
            action: 'Create board',
          },
          {
            name: 'Create Note',
            value: 'createNote',
            description: 'Create a new eKyte Note',
            action: 'Create note',
          },
          {
            name: 'Create Project',
            value: 'createProject',
            description: 'Create a new eKyte Project',
            action: 'Create project',
          },
          {
            name: 'Create Task',
            value: 'createTask',
            description: 'Create a new eKyte Task',
            action: 'Create task',
          },
          {
            name: 'Create Ticket',
            value: 'createTicket',
            description: 'Create a new eKyte Ticket',
            action: 'Create ticket',
          },
          {
            name: 'Create Workspace',
            value: 'createWorkspace',
            description: 'Create a new eKyte Workspace',
            action: 'Create workspace',
          },
          {
            name: 'Get Boards',
            value: 'getBoards',
            description: 'Get boards from eKyte',
            action: 'Get boards',
          },
          {
            name: 'Get Notifications',
            value: 'getNotifications',
            description: 'Get notifications from eKyte',
            action: 'Get notifications',
          },
          {
            name: 'Get Projects',
            value: 'getProjects',
            description: 'Get created projects from eKyte',
            action: 'Get projects',
          },
          {
            name: 'Get Tasks',
            value: 'getTasks',
            description: 'Get tasks from eKyte',
            action: 'Get tasks',
          },
          {
            name: 'Get Tasks Phase',
            value: 'getTasksPhase',
            description: 'Get tasks with phase information from eKyte',
            action: 'Get tasks phase',
          },
          {
            name: 'Get Tickets Changed',
            value: 'getTicketsChanged',
            description: 'Get tickets that have been updated in the last 15 minutes',
            action: 'Get tickets changed',
          },
          {
            name: 'Get Tickets Closed',
            value: 'getTicketsClosed',
            description: 'Get tickets that were closed in the last 15 minutes',
            action: 'Get tickets closed',
          },
          {
            name: 'Get Workspaces',
            value: 'getWorkspaces',
            description: 'Get workspaces from eKyte',
            action: 'Get workspaces',
          },
        ],
        default: 'createTask',
      },
      {
        displayName: 'E-Mail',
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
        displayName: 'Titulo',
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
        displayName: 'ID Tipo Tarefa',
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
        displayName: 'ID Workspace',
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
        displayName: 'Prioridade',
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
        displayName: 'Quantidade De Peças',
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
        displayName: 'ID Projeto',
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
        displayName: 'Descrição',
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
        displayName: 'Iniciar Em',
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
        displayName: 'Concluir Até',
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
        displayName: 'Esforço',
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
        displayName: 'Tarefa Planejada',
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
        displayName: 'Titulo',
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
        displayName: 'Identificação',
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
        displayName: 'Data Início',
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
        displayName: 'Assunto',
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
        displayName: 'Tipo De Ocorrência',
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
        displayName: 'Privisto Para',
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
        displayName: 'E-Mail Do Solicitante',
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
        displayName: 'Em Cópia',
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
        displayName: 'E-Mail Do Responsável',
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
        displayName: 'Descrição',
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
        displayName: 'Titulo',
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
        displayName: 'ID Board',
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
        displayName: 'Titulo',
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
        displayName: 'Conteúdo',
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
        displayName: 'Categoria',
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
        displayName: 'Nome',
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
        displayName: 'ID Squad',
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
          `Intervalo mínimo de ${RATE_LIMIT_MINUTES} minutos não respeitado para a operação "${operation}". Tente novamente em ${remainingSeconds} segundos.`
        );
      }
    }

    const credentials = await this.getCredentials('eKyteApi');
    const apiKey = credentials.apiKey as string;
    const companyId = credentials.companyId as string;

    const baseUrl = 'https://api.ekyte.com/n8n';


    let credentialParams: any = {
      apiKey: apiKey,
      CompanyId: companyId,
    };

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
					credentialParams.UserEmail = userEmail;
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
					credentialParams.UserEmail = userEmail;
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
					credentialParams.UserEmail = userEmail;
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
					credentialParams.UserEmail = userEmail;
          endpoint = `${baseUrl}/polling/notifications`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams
          });
          const notifications = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = notifications.map((notification: any) => ({
            json: notification,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getBoards':
          endpoint = `${baseUrl}/polling/boards`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams
          });
          const boards = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = boards.map((board: any) => ({
            json: board,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getWorkspaces':
          endpoint = `${baseUrl}/polling/workspaces`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams
          });
          const workspaces = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = workspaces.map((workspace: {id: number, name: string}) => ({
            json: workspace,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getProjects':
          endpoint = `${baseUrl}/polling/projects/created`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          const projects = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = projects.map((project: any) => ({
            json: project,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTasks':
          endpoint = `${baseUrl}/polling/tasks`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          const tasks = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = tasks.map((task: any) => ({
            json: task,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTasksPhase':
          endpoint = `${baseUrl}/polling/v2/tasks`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          const tasksPhase = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = tasksPhase.map((task: any) => ({
            json: task,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTicketsChanged':
          endpoint = `${baseUrl}/polling/tickets/concluded`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          const ticketsChanged = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = ticketsChanged.map((ticket: any) => ({
            json: ticket,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        case 'getTicketsClosed':
          endpoint = `${baseUrl}/polling/tickets/changes`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          const ticketsClosed = typeof result === 'string' ? JSON.parse(result) : result;
          returnData = ticketsClosed.map((ticket: any) => ({
            json: ticket,
          }));
          staticData[rateLimitKey] = Date.now();
          return [returnData];

        default:
          throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
      }

      result = await this.helpers.request({
        method: 'POST',
        url: endpoint,
        qs: {
          apiKey: apiKey,
          CompanyId: companyId,
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
      }];

      staticData[rateLimitKey] = Date.now();

      return [returnData];
    } catch (error) {
      throw new NodeOperationError(this.getNode(), `Error executing operation ${operation}: ${(error as Error).message}`);
    }
  }
}