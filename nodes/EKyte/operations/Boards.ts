import { IExecuteFunctions } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions): Promise<any> {
    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('eKyteApi');
    const apiKey = credentials.apiKey as string;
    const companyId = credentials.companyId as string;
    const userEmail = this.getNodeParameter('userEmail', 0) as string;

    const baseUrl = 'https://apistaging.ekyte.com/zapier';

    const credentialParams = {
        apiKey: apiKey,
        CompanyId: companyId,
        UserEmail: userEmail,
    };

    switch (operation) {
        case 'getAll':
            return await this.helpers.request({
                method: 'GET',
                url: `${baseUrl}/boards`,
                qs: credentialParams,
            });

        case 'create':
            const boardData = {
                Title: this.getNodeParameter('title', 0) as string,
                Description: this.getNodeParameter('description', 0) as string,
            };

            return await this.helpers.request({
                method: 'POST',
                url: `${baseUrl}/boards`,
                qs: credentialParams,
                body: boardData,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        default:
            throw new Error(`Operation ${operation} not supported`);
    }
}
