import {
    ICredentialType,
    INodeProperties,
    ICredentialTestRequest,
    IAuthenticate,
} from 'n8n-workflow';

export class EKyteApi implements ICredentialType {
    name = 'eKyteApi';
    displayName = 'eKyte API';
    documentationUrl = 'https://www.ekyte.com/guide/pt-br/suporte/integracao-com-n8n/';
    properties: INodeProperties[] = [
        {
            displayName: 'API Key',
            name: 'apiKey',
            type: 'string',
            typeOptions: {
                password: true,
            },
            default: '',
            required: true,
            description: 'The API key for eKyte authentication',
        },
        {
            displayName: 'Company ID',
            name: 'companyId',
            type: 'string',
            default: '',
            required: true,
            description: 'The Company ID for eKyte authentication',
        },
    ];

    authenticate: IAuthenticate = {
        type: 'generic',
        properties: {
            qs: {
                apiKey: '={{$credentials.apiKey}}',
                CompanyId: '={{$credentials.companyId}}',
            },
        },
    };

    test: ICredentialTestRequest = {
        request: {
            baseURL: 'https://api.ekyte.com/n8n',
            url: '/polling/auth',
            method: 'GET',
        },
    };
}
