import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

export class EKyteProjectsAction implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Projects Action',
    name: 'eKyteProjectsAction',
    icon: 'file:ekyte.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Create projects in eKyte',
    defaults: {
      name: 'eKyte Projects Action',
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
            description: 'Create a new eKyte project',
            action: 'Create project',
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
        displayName: 'Project Name',
        name: 'name',
        type: 'string',
        required: true,
        default: '',
        displayOptions: {
          show: {
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
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Workspace ID',
        name: 'workspaceId',
        type: 'number',
        required: true,
        default: 0,
        description: 'Workspace ID for the project',
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
        const projectData: any = {
          Name: this.getNodeParameter('name', 0) as string,
          Description: this.getNodeParameter('description', 0) as string,
          WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
        };

        const alias = this.getNodeParameter('alias', 0) as string;
        if (alias) {
          projectData.Alias = alias;
        }

        const tags = this.getNodeParameter('tags', 0) as string;
        if (tags) {
          projectData.Tags = tags;
        }

        const startDate = this.getNodeParameter('startDate', 0) as string;
        if (startDate) {
          projectData.StartDate = startDate;
        }

        result = await this.helpers.request({
          method: 'POST',
          url: `${baseUrl}/projects`,
          qs: credentialParams,
          body: projectData,
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
      throw new NodeOperationError(this.getNode(), `Error executing project ${operation}: ${(error as Error).message}`);
    }
  }
}