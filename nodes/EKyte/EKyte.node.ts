import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';
import {
  tasksExecute,
  projectsExecute,
  ticketsExecute,
  notificationsExecute,
  boardsExecute,
  workspacesExecute,
  notesExecute,
} from './index';

export class EKyte implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte API',
    name: 'eKyte',
    icon: 'file:ekyte.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Interact with eKyte API - Get and create tasks, projects, boards, and more',
    defaults: {
      name: 'eKyte API',
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
      baseURL: 'https://api.ekyte.com/zapier',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Board',
            value: 'boards',
          },
          {
            name: 'Note',
            value: 'notes',
          },
          {
            name: 'Notification',
            value: 'notifications',
          },
          {
            name: 'Project',
            value: 'projects',
          },
          {
            name: 'Task',
            value: 'tasks',
          },
          {
            name: 'Ticket',
            value: 'tickets',
          },
          {
            name: 'Workspace',
            value: 'workspaces',
          },
        ],
        default: 'tasks',
      },

      // Tasks Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['tasks'],
          },
        },
        options: [
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get many tasks',
            action: 'Get many tasks',
          },
          {
            name: 'Get All V2',
            value: 'getAllV2',
            description: 'Get all tasks (version 2)',
            action: 'Get all tasks V2',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new task',
            action: 'Create a task',
          },
        ],
        default: 'getAll',
      },
      // Projects Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['projects'],
          },
        },
        options: [
          {
            name: 'Get Created',
            value: 'getCreated',
            description: 'Get created projects',
            action: 'Get created projects',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new project',
            action: 'Create a project',
          },
        ],
        default: 'getCreated',
      },
      // Tickets Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['tickets'],
          },
        },
        options: [
          {
            name: 'Get Concluded',
            value: 'getConcluded',
            description: 'Get concluded tickets',
            action: 'Get concluded tickets',
          },
          {
            name: 'Get Changes',
            value: 'getChanges',
            description: 'Get tickets with changes',
            action: 'Get tickets with changes',
          },
        ],
        default: 'getConcluded',
      },
      // Notifications Operations
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
            name: 'Get Many',
            value: 'getAll',
            description: 'Get many notifications',
            action: 'Get many notifications',
          },
        ],
        default: 'getAll',
      },
      // Boards Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['boards'],
          },
        },
        options: [
          {
            name: 'Get Many',
            value: 'getAll',
            description: 'Get many boards',
            action: 'Get many boards',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new board',
            action: 'Create a board',
          },
        ],
        default: 'getAll',
      },
      // Workspaces Operations
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
            name: 'Get Many',
            value: 'getAll',
            description: 'Get many workspaces',
            action: 'Get many workspaces',
          },
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new workspace',
            action: 'Create a workspace',
          },
        ],
        default: 'getAll',
      },
      // Notes Operations
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['notes'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new note',
            action: 'Create a note',
          },
        ],
        default: 'create',
      },
      // Common Parameters
      // Task Creation Parameters
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        required: true,
        default: '',
        description: 'Task title',
        displayOptions: {
          show: {
            resource: ['tasks'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Workspace ID',
        name: 'workspaceId',
        type: 'number',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['tasks'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Task Type ID',
        name: 'ctcTaskTypeId',
        type: 'number',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['tasks'],
            operation: ['create'],
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
            resource: ['tasks'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Description',
        name: 'description',
        type: 'string',
        default: '',
        description: 'Task description',
        displayOptions: {
          show: {
            resource: ['tasks'],
            operation: ['create'],
          },
        },
      },
      // Project Creation Parameters
      {
        displayName: 'Project Name',
        name: 'name',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['projects'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Project Alias',
        name: 'alias',
        type: 'string',
        default: '',
        description: 'Project alias (optional)',
        displayOptions: {
          show: {
            resource: ['projects'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Project Description',
        name: 'description',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['projects'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'dateTime',
        default: '',
        description: 'Project start date (optional)',
        displayOptions: {
          show: {
            resource: ['projects'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Tags',
        name: 'tags',
        type: 'string',
        default: '',
        description: 'Project tags separated by | (pipe)',
        displayOptions: {
          show: {
            resource: ['projects'],
            operation: ['create'],
          },
        },
      },
      // Board Creation Parameters
      {
        displayName: 'Board Title',
        name: 'title',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['boards'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Board Description',
        name: 'description',
        type: 'string',
        default: '',
        displayOptions: {
          show: {
            resource: ['boards'],
            operation: ['create'],
          },
        },
      },
      // Note Creation Parameters
      {
        displayName: 'Note Content',
        name: 'content',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['notes'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Plan ID',
        name: 'planId',
        type: 'number',
        required: true,
        default: '',
        description: 'Plan/Board ID',
        displayOptions: {
          show: {
            resource: ['notes'],
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Category',
        name: 'category',
        type: 'string',
        default: '',
        description: 'Note category',
        displayOptions: {
          show: {
            resource: ['notes'],
            operation: ['create'],
          },
        },
      },
      // Workspace Creation Parameters
      {
        displayName: 'Workspace Name',
        name: 'name',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
            resource: ['workspaces'],
            operation: ['create'],
          },
        },
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    try {
      let returnData: INodeExecutionData[] = [];

      let result: any;

      if (resource === 'tasks') {
        result = await tasksExecute.call(this);
      } else if (resource === 'projects') {
        result = await projectsExecute.call(this);
      } else if (resource === 'tickets') {
        result = await ticketsExecute.call(this);
      } else if (resource === 'notifications') {
        result = await notificationsExecute.call(this);
      } else if (resource === 'boards') {
        result = await boardsExecute.call(this);
      } else if (resource === 'workspaces') {
        result = await workspacesExecute.call(this);
      } else if (resource === 'notes') {
        result = await notesExecute.call(this);
      } else {
        throw new NodeOperationError(this.getNode(), `Invalid resource or operation: ${resource}/${operation}`);
      }

      returnData = [{
        json: result,
      }];

      // Wrap the return data in an array to match INodeExecutionData[][]
      return [returnData];
    } catch (error) {
      throw new NodeOperationError(this.getNode(), `Error executing ${resource}/${operation}: ${(error as Error).message}`);
    }
  }
}
