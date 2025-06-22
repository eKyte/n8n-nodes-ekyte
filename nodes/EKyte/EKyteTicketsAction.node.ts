import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  INodeExecutionData,
  NodeOperationError,
} from 'n8n-workflow';

export class EKyteTicketsAction implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'eKyte Tickets Action',
    name: 'eKyteTicketsAction',
    icon: 'file:ekyte.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Create tickets in eKyte',
    defaults: {
      name: 'eKyte Tickets Action',
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
            description: 'Create a new eKyte ticket',
            action: 'Create ticket',
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
        displayName: 'Subject',
        name: 'subject',
        type: 'string',
        required: true,
        default: '',
        description: 'Ticket subject',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Message',
        name: 'message',
        type: 'string',
        required: true,
        default: '',
        description: 'Ticket message/description',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Requester Email',
        name: 'requesterEmail',
        type: 'string',
        required: true,
        default: '',
        description: 'Email of the person requesting the ticket',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Ticket Type',
        name: 'ticketType',
        type: 'options',
        options: [
          {
            name: 'Request',
            value: 1,
          },
          {
            name: 'Incident',
            value: 2,
          },
          {
            name: 'Problem',
            value: 3,
          },
          {
            name: 'Change',
            value: 4,
          },
        ],
        default: 1,
        description: 'Type of ticket',
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
        displayName: 'Expected Due Date',
        name: 'expectDueDate',
        type: 'dateTime',
        default: '',
        description: 'Expected due date for the ticket (optional)',
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
        default: 0,
        description: 'Workspace ID for the ticket (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Project ID',
        name: 'projectId',
        type: 'number',
        default: 0,
        description: 'Project ID for the ticket (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Analyst Email',
        name: 'analystEmail',
        type: 'string',
        default: '',
        description: 'Email of the analyst assigned to the ticket (optional)',
        displayOptions: {
          show: {
            operation: ['create'],
          },
        },
      },
      {
        displayName: 'Users CC',
        name: 'usersCC',
        type: 'string',
        default: '',
        description: 'Comma-separated list of emails to CC on the ticket (optional)',
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
        const ticketData: any = {
          Subject: this.getNodeParameter('subject', 0) as string,
          Message: this.getNodeParameter('message', 0) as string,
          RequesterEmail: this.getNodeParameter('requesterEmail', 0) as string,
          TicketType: this.getNodeParameter('ticketType', 0) as number,
          PriorityGroup: this.getNodeParameter('priorityGroup', 0) as number,
          UserEmail: userEmail,
        };

        const expectDueDate = this.getNodeParameter('expectDueDate', 0) as string;
        if (expectDueDate) {
          ticketData.ExpectDueDate = expectDueDate;
        }

        const workspaceId = this.getNodeParameter('workspaceId', 0) as number;
        if (workspaceId > 0) {
          ticketData.WorkspaceId = workspaceId;
        }

        const projectId = this.getNodeParameter('projectId', 0) as number;
        if (projectId > 0) {
          ticketData.ProjectId = projectId;
        }

        const analystEmail = this.getNodeParameter('analystEmail', 0) as string;
        if (analystEmail) {
          ticketData.AnalystEmail = analystEmail;
        }

        const usersCC = this.getNodeParameter('usersCC', 0) as string;
        if (usersCC) {
          ticketData.UsersCC = usersCC;
        }

        result = await this.helpers.request({
          method: 'POST',
          url: `${baseUrl}/tickets`,
          qs: credentialParams,
          body: ticketData,
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
      throw new NodeOperationError(this.getNode(), `Error executing ticket ${operation}: ${(error as Error).message}`);
    }
  }
}