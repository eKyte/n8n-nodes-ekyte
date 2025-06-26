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
      baseURL: 'https://apistaging.ekyte.com/zapier',
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
        ],
        default: 'createTask',
      },
      {
        displayName: 'E-mail',
        name: 'userEmail',
        type: 'string',
        required: true,
        default: '',
        description: 'The user email for eKyte operations',
        displayOptions: {
          show: {
            operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'createNote', 'createWorkspace'],
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
        displayName: 'Id Tipo Tarefa',
        name: 'ctcTaskTypeId',
        type: 'number',
        required: true,
        default: 0,
        displayOptions: {
          show: {
            operation: ['createTask'],
          },
        },
      },
      {
        displayName: 'Id Workspace',
        name: 'workspaceId',
        type: 'number',
        required: true,
        default: 0,
        displayOptions: {
          show: {
            operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'createNote', 'createWorkspace'],
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
        displayName: 'Quantidade de peças',
        name: 'quantity',
        type: 'number',
        default: 0,
        displayOptions: {
          show: {
            operation: ['createTask'],
          },
        },
      },
      {
        displayName: 'Id Projeto',
        name: 'ctcTaskProjectId',
        type: 'number',
        default: 0,
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
        displayName: 'Iniciar em',
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
        displayName: 'Concluir até',
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
        displayName: 'Tarefa planejada',
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
        displayName: 'Tipo de ocorrência',
        name: 'ticketType',
        type: 'number',
        required: true,
        default: 1,
        displayOptions: {
          show: {
            operation: ['createTicket'],
          },
        },
      },
      {
        displayName: 'Privisto para',
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
        displayName: 'E-mail do solicitante',
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
        displayName: 'Em cópia',
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
        displayName: 'E-mail do responsável',
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
        displayName: 'Id Board',
        name: 'planId',
        type: 'number',
        required: true,
        default: 0,
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
        displayName: 'Id Squad',
        name: 'squadId',
        type: 'number',
        default: 0,
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

    const credentials = await this.getCredentials('eKyteApi');
    const apiKey = credentials.apiKey as string;
    const companyId = credentials.companyId as string;

    const baseUrl = 'https://apistaging.ekyte.com/zapier';

    // Check if operation is GET (doesn't need UserEmail)
    const isGetOperation = ['getNotifications', 'getProjects', 'getTasks', 'getTasksPhase', 'getTicketsChanged', 'getTicketsClosed'].includes(operation);

    let credentialParams: any = {
      apiKey: apiKey,
      CompanyId: companyId,
    };

    let userEmail = '';
    if (!isGetOperation) {
      userEmail = this.getNodeParameter('userEmail', 0) as string;
      credentialParams.UserEmail = userEmail;
    }

    try {
      let returnData: INodeExecutionData[] = [];
      let result: any;
      let endpoint = '';
      let requestBody: any = {};


      switch (operation) {
        case 'createTask':
          endpoint = `${baseUrl}/tasks`;
          requestBody = {
            UserEmail: userEmail,
            Title: this.getNodeParameter('title', 0) as string,
            CtcTaskTypeId: this.getNodeParameter('ctcTaskTypeId', 0) as number,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
            PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
            Quantity: this.getNodeParameter('quantity', 0) as number,
            CtcTaskProjectId: this.getNodeParameter('ctcTaskProjectId', 0) as number,
            Description: this.getNodeParameter('description', 0) as string,
            PhaseStartDate: this.getNodeParameter('phaseStartDate', 0) as string,
            CurrentDueDate: this.getNodeParameter('currentDueDate', 0) as string,
            EstimatedTime: this.getNodeParameter('estimatedTime', 0) as number,
            PlanTask: this.getNodeParameter('planTask', 0) as boolean,
          };
          break;

        case 'createProject':
          endpoint = `${baseUrl}/projects`;
          requestBody = {
            Name: this.getNodeParameter('projectName', 0) as string,
            Alias: this.getNodeParameter('alias', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
            Tags: this.getNodeParameter('tags', 0) as string,
            StartDate: this.getNodeParameter('startDate', 0) as string,
          };
          break;

        case 'createTicket':
          endpoint = `${baseUrl}/tickets`;
          requestBody = {
            UserEmail: userEmail,
            Subject: this.getNodeParameter('subject', 0) as string,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
            TicketType: this.getNodeParameter('ticketType', 0) as number,
            ExpectDueDate: this.getNodeParameter('expectDueDate', 0) as string,
            PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
            RequesterEmail: this.getNodeParameter('requesterEmail', 0) as string,
            UsersCC: this.getNodeParameter('usersCC', 0) as string,
            AnalystEmail: this.getNodeParameter('analystEmail', 0) as string,
            Message: this.getNodeParameter('message', 0) as string,
          };
          break;

        case 'createBoard':
          endpoint = `${baseUrl}/boards`;
          requestBody = {
            Title: this.getNodeParameter('boardTitle', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
          };
          break;

        case 'createWorkspace':
          endpoint = `${baseUrl}/workspaces`;
          requestBody = {
            Name: this.getNodeParameter('workspaceName', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            SquadId: this.getNodeParameter('squadId', 0) as number,
          };
          break;

        case 'createNote':
          endpoint = `${baseUrl}/notes`;
          requestBody = {
            PlanId: this.getNodeParameter('planId', 0) as number,
            Title: this.getNodeParameter('noteTitle', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            Content: this.getNodeParameter('content', 0) as string,
            Category: this.getNodeParameter('category', 0) as string,
          };
          break;

        case 'getNotifications':
          endpoint = `${baseUrl}/polling/notifications`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          returnData = [{
            json: result,
          }];
          return [returnData];

        case 'getProjects':
          endpoint = `${baseUrl}/polling/projects/created`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          returnData = [{
            json: result,
          }];
          return [returnData];

        case 'getTasks':
          endpoint = `${baseUrl}/polling/tasks`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          returnData = [{
            json: result,
          }];
          return [returnData];

        case 'getTasksPhase':
          endpoint = `${baseUrl}/polling/v2/tasks`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          returnData = [{
            json: result,
          }];
          return [returnData];

        case 'getTicketsChanged':
          endpoint = `${baseUrl}/polling/tickets/concluded`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          returnData = [{
            json: result,
          }];
          return [returnData];

        case 'getTicketsClosed':
          endpoint = `${baseUrl}/polling/tickets/changes`;
          result = await this.helpers.request({
            method: 'GET',
            url: endpoint,
            qs: credentialParams,
          });
          returnData = [{
            json: result,
          }];
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

      returnData = [{
        json: result,
      }];

      return [returnData];
    } catch (error) {
      throw new NodeOperationError(this.getNode(), `Error executing operation ${operation}: ${(error as Error).message}`);
    }
  }
}