import { ActionProcessor, ActionError } from 'fbl';
import KeycloakAdminClient from 'keycloak-admin';
import { ICredentials } from '../../interfaces';
import * as request from 'request';
import { KeycloakClient } from '../../helpers/KeycloakClient';

export abstract class BaseConnectionActionProcessor extends ActionProcessor {
    /**
     * Create new instance of `keycloak-admin` client and authenticate with provided credentials
     * @param credentials
     */
    async getKeycloakAdminClient(credentials: ICredentials): Promise<KeycloakClient> {
        const client = new KeycloakClient(credentials, this.snapshot);
        await client.auth();

        return client;
    }
}
