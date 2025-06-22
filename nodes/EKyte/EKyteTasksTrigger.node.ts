import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';

export class EKyteTasksTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Tasks Trigger',
    name: 'eKyteTasksTrigger',
    icon: 'file:ekyte.svg',
    group: ['trigger'],
    version: 1,
    description: 'Triggers when new tasks are available from eKyte API',
    defaults: {
      name: 'eKyte Tasks Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'eKyteApi',
        required: true,
      },
    ],
    polling: true,
    properties: [
      {
        displayName: 'User Email',
        name: 'userEmail',
        type: 'string',
        required: true,
        default: '',
        description: 'The user email for eKyte operations',
      },
      {
        displayName: 'API Version',
        name: 'apiVersion',
        type: 'options',
        options: [
          {
            name: 'Version 1',
            value: 'v1',
          },
          {
            name: 'Version 2',
            value: 'v2',
          },
        ],
        default: 'v1',
        description: 'API version to use',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const userEmail = this.getNodeParameter('userEmail') as string;
    const apiVersion = this.getNodeParameter('apiVersion') as string;

    const credentials = await this.getCredentials('eKyteApi');
    const apiKey = credentials.apiKey as string;
    const companyId = credentials.companyId as string;

    const baseUrl = 'https://apistaging.ekyte.com/zapier';
    
    const credentialParams = {
      apiKey: apiKey,
      CompanyId: companyId,
      UserEmail: userEmail,
    };

    const manualTriggerFunction = async () => {
      try {
        const endpoint = apiVersion === 'v2' ? `${baseUrl}/v2/tasks` : `${baseUrl}/tasks`;
        
        const response = await this.helpers.request({
          method: 'GET',
          url: endpoint,
          qs: credentialParams,
        });

        this.emit([[{
          json: response,
        }]]);
      } catch (error) {
        this.emit([[{
          json: { error: `Failed to fetch tasks: ${(error as Error).message}` },
        }]]);
      }
    };

    return {
      manualTriggerFunction,
    };
  }
}