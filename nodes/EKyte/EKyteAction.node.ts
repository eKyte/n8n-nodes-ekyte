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
    description: 'Create data in eKyte (tasks, projects, tickets, boards, workspaces, notes)',
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
        ],
        default: 'createTask',
      },
      {
        displayName: 'User Email',
        name: 'userEmail',
        type: 'string',
        required: true,
        default: '',
        description: 'The user email for eKyte operations',
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
        displayName: 'Workspace ID',
        name: 'workspaceId',
        type: 'number',
        required: true,
        default: 0,
        displayOptions: {
          show: {
            operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'createNote'],
          },
        },
      },
      {
        displayName: 'Task Type ID',
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
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            operation: ['createTask', 'createProject', 'createTicket', 'createBoard', 'createNote'],
          },
        },
      },
      {
        displayName: 'Priority Group',
        name: 'priorityGroup',
        type: 'number',
        default: 0,
        description: 'Priority group (0-100, where 0=Not prioritized, 1-25=Low, 26-50=Medium, 51-75=High, 76-100=Urgent)',
        displayOptions: {
          show: {
            operation: ['createTask'],
          },
        },
      },
      {
        displayName: 'Plan Task',
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
        displayName: 'Project Name',
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
        displayName: 'Project Type ID',
        name: 'ctcProjectTypeId',
        type: 'number',
        required: true,
        default: 0,
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
        required: true,
        default: '',
        description: 'Project start date',
        displayOptions: {
          show: {
            operation: ['createProject'],
          },
        },
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'dateTime',
        required: true,
        default: '',
        description: 'Project end date',
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
        displayName: 'Ticket Type ID',
        name: 'ctcTicketTypeId',
        type: 'number',
        required: true,
        default: 0,
        displayOptions: {
          show: {
            operation: ['createTicket'],
          },
        },
      },
      // Board fields
      {
        displayName: 'Board Name',
        name: 'boardName',
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
        displayName: 'Note Title',
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
        displayName: 'Plan ID',
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
        displayName: 'Workspace Name',
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
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const operation = this.getNodeParameter('operation', 0) as string;
    const userEmail = this.getNodeParameter('userEmail', 0) as string;

    const credentials = await this.getCredentials('eKyteApi');
    const apiKey = credentials.apiKey as string;
    const companyId = credentials.companyId as string;

    const baseUrl = 'https://apistaging.ekyte.com/zapier';

    const credentialParams = {
      apiKey: apiKey,
      CompanyId: companyId,
      UserEmail: userEmail,
    };

    try {
      let returnData: INodeExecutionData[] = [];
      let result: any;
      let endpoint = '';
      let requestBody: any = {
        UserEmail: userEmail,
      };

      switch (operation) {
        case 'createTask':
          endpoint = `${baseUrl}/tasks`;
          requestBody = {
            ...requestBody,
            Title: this.getNodeParameter('title', 0) as string,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
            CtcTaskTypeId: this.getNodeParameter('ctcTaskTypeId', 0) as number,
            CurrentDueDate: this.getNodeParameter('currentDueDate', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
            PlanTask: this.getNodeParameter('planTask', 0) as boolean,
          };
          break;

        case 'createProject':
          endpoint = `${baseUrl}/projects`;
          requestBody = {
            ...requestBody,
            Name: this.getNodeParameter('projectName', 0) as string,
            CtcProjectTypeId: this.getNodeParameter('ctcProjectTypeId', 0) as number,
            StartDate: this.getNodeParameter('startDate', 0) as string,
            EndDate: this.getNodeParameter('endDate', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
          };
          break;

        case 'createTicket':
          endpoint = `${baseUrl}/tickets`;
          requestBody = {
            ...requestBody,
            Subject: this.getNodeParameter('subject', 0) as string,
            TicketType: this.getNodeParameter('ctcTicketTypeId', 0) as number,
            Message: this.getNodeParameter('description', 0) as string,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
            RequesterEmail: userEmail,
          };
          break;

        case 'createBoard':
          endpoint = `${baseUrl}/boards`;
          requestBody = {
            ...requestBody,
            Title: this.getNodeParameter('boardName', 0) as string,
            Description: this.getNodeParameter('description', 0) as string,
            WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
          };
          break;

        case 'createWorkspace':
          endpoint = `${baseUrl}/workspaces`;
          requestBody = {
            ...requestBody,
            Name: this.getNodeParameter('workspaceName', 0) as string,
          };
          break;

        case 'createNote':
          endpoint = `${baseUrl}/notes`;
          requestBody = {
            ...requestBody,
            Title: this.getNodeParameter('noteTitle', 0) as string,
            Content: this.getNodeParameter('description', 0) as string,
            PlanId: this.getNodeParameter('planId', 0) as number,
            Category: this.getNodeParameter('category', 0) as string,
          };
          break;

        default:
          throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
      }

      result = await this.helpers.request({
        method: 'POST',
        url: endpoint,
        qs: credentialParams,
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