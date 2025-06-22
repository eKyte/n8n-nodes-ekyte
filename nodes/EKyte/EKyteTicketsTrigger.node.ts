import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
} from 'n8n-workflow';

export class EKyteTicketsTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Tickets Trigger',
    name: 'eKyteTicketsTrigger',
    icon: 'file:ekyte.svg',
    group: ['trigger'],
    version: 1,
    description: 'Triggers when tickets with changes or concluded tickets are available from eKyte API',
    defaults: {
      name: 'eKyte Tickets Trigger',
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
        displayName: 'Operation Type',
        name: 'operationType',
        type: 'options',
        options: [
          {
            name: 'Get Concluded',
            value: 'concluded',
          },
          {
            name: 'Get Changes',
            value: 'changes',
          },
        ],
        default: 'concluded',
        description: 'Type of tickets to monitor',
      },
    ],
  };

  async trigger(this: ITriggerFunctions): Promise<ITriggerResponse> {
    const userEmail = this.getNodeParameter('userEmail') as string;
    const operationType = this.getNodeParameter('operationType') as string;

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
        const endpoint = operationType === 'concluded' ? 
          `${baseUrl}/tickets/concluded` : 
          `${baseUrl}/tickets/changes`;
        
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
          json: { error: `Failed to fetch tickets: ${(error as Error).message}` },
        }]]);
      }
    };

    return {
      manualTriggerFunction,
    };
  }
}