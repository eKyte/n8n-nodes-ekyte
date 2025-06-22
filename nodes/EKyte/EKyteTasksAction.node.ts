import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

export class EKyteTasksAction implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Tasks Action',
    name: 'eKyteTasksAction',
    icon: 'file:ekyte.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Create tasks in eKyte',
    defaults: {
      name: 'eKyte Tasks Action',
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
            name: 'Create',
            value: 'create',
            description: 'Create a new eKyte task',
            action: 'Create task',
          },
        ],
        default: 'create',
      },
      {
        displayName: 'User Email',
        name: 'userEmail',
        type: 'string',
        required: true,
        default: '',
        description: 'The user email for eKyte operations',
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        required: true,
        default: '',
        description: 'Task title',
        displayOptions: {
          show: {
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
            operation: ['create'],
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
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Quantity',
        name: 'quantity',
        type: 'number',
        default: 0,
        description: 'Task quantity (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Estimated Time',
        name: 'estimatedTime',
        type: 'number',
        default: 0,
        description: 'Estimated time in minutes (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Project ID',
        name: 'ctcTaskProjectId',
        type: 'number',
        default: 0,
        description: 'Project ID to link the task to (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Plan Task',
        name: 'planTask',
        type: 'options',
        options: [
          {
            name: 'Yes',
            value: true,
          },
          {
            name: 'No',
            value: false,
          },
        ],
        default: true,
        description: 'Whether this is a planned task',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Phase Start Date',
        name: 'phaseStartDate',
        type: 'dateTime',
        default: '',
        description: 'Phase start date (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
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

      if (operation === 'create') {
        const taskData: any = {
          Title: this.getNodeParameter('title', 0) as string,
          WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
          CtcTaskTypeId: this.getNodeParameter('ctcTaskTypeId', 0) as number,
          CurrentDueDate: this.getNodeParameter('currentDueDate', 0) as string,
          Description: this.getNodeParameter('description', 0) as string,
          PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
          PlanTask: this.getNodeParameter('planTask', 0) as boolean,
          UserEmail: userEmail,
        };

        const quantity = this.getNodeParameter('quantity', 0) as number;
        if (quantity > 0) {
          taskData.Quantity = quantity;
        }

        const estimatedTime = this.getNodeParameter('estimatedTime', 0) as number;
        if (estimatedTime > 0) {
          taskData.EstimatedTime = estimatedTime;
        }

        const projectId = this.getNodeParameter('ctcTaskProjectId', 0) as number;
        if (projectId > 0) {
          taskData.CtcTaskProjectId = projectId;
        }

        const phaseStartDate = this.getNodeParameter('phaseStartDate', 0) as string;
        if (phaseStartDate) {
          taskData.PhaseStartDate = phaseStartDate;
        }

        result = await this.helpers.request({
          method: 'POST',
          url: `${baseUrl}/tasks`,
          qs: credentialParams,
          body: taskData,
          headers: {
            'Content-Type': 'application/json',
          },
        });
      } else {
        throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
      }

      returnData = [{
        json: result,
      }];

      return [returnData];
    } catch (error) {
      throw new NodeOperationError(this.getNode(), `Error executing task ${operation}: ${(error as Error).message}`);
    }
  }
}