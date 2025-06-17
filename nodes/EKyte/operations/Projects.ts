import { IExecuteFunctions } from 'n8n-workflow';

export async function execute(this: IExecuteFunctions): Promise<any> {
    const operation = this.getNodeParameter('operation', 0) as string;
    const credentials = await this.getCredentials('eKyteApi');
    const apiKey = credentials.apiKey as string;
    const companyId = credentials.companyId as string;
    const userEmail = credentials.userEmail as string;

    const baseUrl = 'https://api.ekyte.com/zapier';

    const credentialParams = {
        apiKey: apiKey,
        CompanyId: companyId,
        UserEmail: userEmail,
    };

    switch (operation) {
        case 'getCreated':
            return await this.helpers.request({
                method: 'GET',
                url: `${baseUrl}/projects/created`,
                qs: credentialParams,
            });

        case 'create':
            const projectData = this.getNodeParameter('projectData', 0) as object;
            return await this.helpers.request({
                method: 'POST',
                url: `${baseUrl}/projects`,
                qs: credentialParams,
                body: projectData,
                headers: {
                    'Content-Type': 'application/json',
                },
            });

        default:
            throw new Error(`Operation ${operation} not supported`);
    }
}
