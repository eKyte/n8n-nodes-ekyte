import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

export class EKyteBoardsAction implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Boards Action',
    name: 'eKyteBoardsAction',
    icon: 'file:ekyte.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Create boards in eKyte',
    defaults: {
      name: 'eKyte Boards Action',
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
            description: 'Create a new eKyte board',
            action: 'Create board',
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
        displayName: 'Board Title',
        name: 'title',
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
        displayName: 'Board Description',
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
        displayName: 'Workspace ID',
        name: 'workspaceId',
        type: 'number',
        required: true,
        default: 0,
        description: 'The workspace ID where the board will be created',
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
        const boardData = {
          Title: this.getNodeParameter('title', 0) as string,
          Description: this.getNodeParameter('description', 0) as string,
          WorkspaceId: this.getNodeParameter('workspaceId', 0) as number,
        };

        result = await this.helpers.request({
          method: 'POST',
          url: `${baseUrl}/boards`,
          qs: credentialParams,
          body: boardData,
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
      throw new NodeOperationError(this.getNode(), `Error executing board ${operation}: ${(error as Error).message}`);
    }
  }
}