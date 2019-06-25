import { ActionProcessor } from 'fbl';
import KeycloakAdminClient from 'keycloak-admin';
import { ICredentials } from '../interfaces';

export abstract class BaseKeycloakAdminClientActionProcessor extends ActionProcessor {
    /**
     * Create new instance of `keycloak-admin` client and authenticate with provided credentials
     */
    async getKeycloakAdminClient(credentials: ICredentials): Promise<KeycloakAdminClient> {
        const client = new KeycloakAdminClient(credentials);
        await client.auth(credentials);

        return client;
    }
}
