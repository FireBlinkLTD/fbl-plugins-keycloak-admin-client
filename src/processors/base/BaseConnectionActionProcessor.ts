import { ActionProcessor } from 'fbl';
import { KeycloakClient } from '../../helpers/KeycloakClient';

export abstract class BaseConnectionActionProcessor extends ActionProcessor {
    /**
     * Create new instance of `keycloak-admin` client and authenticate with provided credentials
     * @param credentials
     */
    async getKeycloakAdminClient(credentials: any): Promise<KeycloakClient> {
        const client = new KeycloakClient(credentials, this.snapshot);
        await client.auth();

        return client;
    }
}
