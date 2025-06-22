import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';

export class EKyteNotificationsTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Notifications Trigger',
    name: 'eKyteNotificationsTrigger',
    icon: 'file:ekyte.svg',
    group: ['trigger'],
    version: 1,
    description: 'Triggers when new notifications are available from eKyte API',
    defaults: {
      name: 'eKyte Notifications Trigger',
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
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const userEmail = this.getNodeParameter('userEmail') as string;

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
        const response = await this.helpers.request({
          method: 'GET',
          url: `${baseUrl}/notifications`,
          qs: credentialParams,
        });

        this.emit([[{
          json: response,
        }]]);
      } catch (error) {
        this.emit([[{
          json: { error: `Failed to fetch notifications: ${(error as Error).message}` },
        }]]);
      }
    };

    return {
      manualTriggerFunction,
    };
  }
}