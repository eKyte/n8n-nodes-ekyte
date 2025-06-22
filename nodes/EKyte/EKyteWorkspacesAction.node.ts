import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

export class EKyteWorkspacesAction implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Workspaces Action',
    name: 'eKyteWorkspacesAction',
    icon: 'file:ekyte.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Create workspaces in eKyte',
    defaults: {
      name: 'eKyte Workspaces Action',
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
            description: 'Create a new eKyte workspace',
            action: 'Create workspace',
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
        displayName: 'Workspace Name',
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
        displayName: 'Company ID',
        name: 'companyId',
        type: 'number',
        required: true,
        default: 0,
        description: 'The company ID that owns this workspace',
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
        description: 'Workspace description',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Active',
        name: 'active',
        type: 'options',
        options: [
          {
            name: 'Yes',
            value: 'Yes',
          },
          {
            name: 'No',
            value: 'No',
          },
        ],
        default: 'Yes',
        description: 'Whether the workspace is active',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Default Language',
        name: 'defaultLanguage',
        type: 'string',
        default: 'pt-BR',
        description: 'Default language for the workspace',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Share Audiences and Personas',
        name: 'shareAudiencesAndPersonas',
        type: 'options',
        options: [
          {
            name: 'Yes',
            value: 'Yes',
          },
          {
            name: 'No',
            value: 'No',
          },
        ],
        default: 'No',
        description: 'Whether to share audiences and personas',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Share Channels',
        name: 'shareChannels',
        type: 'options',
        options: [
          {
            name: 'Yes',
            value: 'Yes',
          },
          {
            name: 'No',
            value: 'No',
          },
        ],
        default: 'No',
        description: 'Whether to share channels',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Enable GenAI',
        name: 'enableGenAi',
        type: 'options',
        options: [
          {
            name: 'Yes',
            value: 'Yes',
          },
          {
            name: 'No',
            value: 'No',
          },
        ],
        default: 'No',
        description: 'Whether to enable GenAI features',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Avatar ID',
        name: 'avatarId',
        type: 'number',
        default: 0,
        description: 'Avatar ID for the workspace (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Squad ID',
        name: 'squadId',
        type: 'number',
        default: 0,
        description: 'Squad ID for the workspace (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'External ID',
        name: 'externalId',
        type: 'string',
        default: '',
        description: 'External ID for integration purposes (optional)',
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
        const workspaceData: any = {
          Name: this.getNodeParameter('name', 0) as string,
          CompanyId: this.getNodeParameter('companyId', 0) as number,
          Description: this.getNodeParameter('description', 0) as string,
          Active: this.getNodeParameter('active', 0) as string,
          DefaultLanguage: this.getNodeParameter('defaultLanguage', 0) as string,
          ShareAudiencesAndPersonas: this.getNodeParameter('shareAudiencesAndPersonas', 0) as string,
          ShareChannels: this.getNodeParameter('shareChannels', 0) as string,
          EnableGenAi: this.getNodeParameter('enableGenAi', 0) as string,
        };

        const avatarId = this.getNodeParameter('avatarId', 0) as number;
        if (avatarId > 0) {
          workspaceData.AvatarId = avatarId;
        }

        const squadId = this.getNodeParameter('squadId', 0) as number;
        if (squadId > 0) {
          workspaceData.SquadId = squadId;
        }

        const externalId = this.getNodeParameter('externalId', 0) as string;
        if (externalId) {
          workspaceData.ExternalId = externalId;
        }

        result = await this.helpers.request({
          method: 'POST',
          url: `${baseUrl}/workspaces`,
          qs: credentialParams,
          body: workspaceData,
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
      throw new NodeOperationError(this.getNode(), `Error executing workspace ${operation}: ${(error as Error).message}`);
    }
  }
}