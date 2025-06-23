import {
  ITriggerFunctions,
  INodeType,
  INodeTypeDescription,
  ITriggerResponse,
  NodeOperationError,
} from 'n8n-workflow';

export class EKyteTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Trigger',
    name: 'eKyteTrigger',
    icon: 'file:ekyte.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Listen for events from eKyte (notifications, projects, tasks, tickets)',
    defaults: {
      name: 'eKyte Trigger',
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
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Notifications',
            value: 'notifications',
            description: 'Triggers when a new notification is created or changed',
            action: 'On notification',
          },
          {
            name: 'Project',
            value: 'project',
            description: 'Triggers when a new Project is created',
            action: 'On project created',
          },
          {
            name: 'Tasks',
            value: 'tasks',
            description: 'Triggers when task is changed',
            action: 'On task changed',
          },
          {
            name: 'Tasks Phase Done',
            value: 'tasksPhase',
            description: 'Triggers when task is created or has a phase changed',
            action: 'On task phase done',
          },
          {
            name: 'Tickets Changed',
            value: 'ticketsChanged',
            description: 'Triggers all tickets that have been updated in the last 15 minutes',
            action: 'On ticket changed',
          },
          {
            name: 'Tickets Closed',
            value: 'ticketsClosed',
            description: 'Triggers all tickets that were closed in the last 15 minutes',
            action: 'On ticket closed',
          },
        ],
        default: 'tasks',
      },
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
    const operation = this.getNodeParameter('operation') as string;
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
        let endpoint = '';
        
        switch (operation) {
          case 'notifications':
            endpoint = `${baseUrl}/notifications`;
            break;
          case 'project':
            endpoint = `${baseUrl}/projects/created`;
            break;
          case 'tasks':
            endpoint = `${baseUrl}/tasks`;
            break;
          case 'tasksPhase':
            endpoint = `${baseUrl}/v2/tasks`;
            break;
          case 'ticketsChanged':
            endpoint = `${baseUrl}/tickets/concluded`;
            break;
          case 'ticketsClosed':
            endpoint = `${baseUrl}/tickets/changes`;
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Operation ${operation} not supported`);
        }
        
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
          json: { error: `Failed to fetch operation ${operation}: ${(error as Error).message}` },
        }]]);
      }
    };

    return {
      manualTriggerFunction,
    };
  }
}