import {
    ICredentialType,
    INodeProperties,
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
}
