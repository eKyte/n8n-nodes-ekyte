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
        case 'getCreated':
            return await this.helpers.request({
                method: 'GET',
                url: `${baseUrl}/projects/created`,
                qs: credentialParams,
            });

        case 'create':
            const projectData = {
                Name: this.getNodeParameter('name', 0) as string,
                Alias: this.getNodeParameter('alias', 0) as string,
                Description: this.getNodeParameter('description', 0) as string,
                WorkspaceId: this.getNodeParameter('workspaceId', 0) as string,
                Tags: this.getNodeParameter('tags', 0) as string,
                StartDate: this.getNodeParameter('startDate', 0) as string,
            };

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
