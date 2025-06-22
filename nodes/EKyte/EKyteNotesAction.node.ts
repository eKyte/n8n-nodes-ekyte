import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

export class EKyteNotesAction implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Notes Action',
    name: 'eKyteNotesAction',
    icon: 'file:ekyte.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Create notes in eKyte',
    defaults: {
      name: 'eKyte Notes Action',
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
            description: 'Create a new eKyte note',
            action: 'Create note',
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
        displayName: 'Note Content',
        name: 'content',
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
        displayName: 'Plan ID',
        name: 'planId',
        type: 'number',
        required: true,
        default: '',
        description: 'Plan/Board ID',
        displayOptions: {
          show: {
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
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Title',
        name: 'title',
        type: 'string',
        required: true,
        default: '',
        description: 'Note title',
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
        description: 'Note description',
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
        const noteData = {
          Content: this.getNodeParameter('content', 0) as string,
          PlanId: this.getNodeParameter('planId', 0) as number,
          Category: this.getNodeParameter('category', 0) as string,
          Title: this.getNodeParameter('title', 0) as string,
          Description: this.getNodeParameter('description', 0) as string,
        };

        result = await this.helpers.request({
          method: 'POST',
          url: `${baseUrl}/notes`,
          qs: credentialParams,
          body: noteData,
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
      throw new NodeOperationError(this.getNode(), `Error executing note ${operation}: ${(error as Error).message}`);
    }
  }
}