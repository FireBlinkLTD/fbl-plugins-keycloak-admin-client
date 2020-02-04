import { ActionError } from 'fbl';
import { KeycloakClient } from '../../../helpers/KeycloakClient';
import { BaseActionProcessor } from '../../base';

export abstract class BaseServiceAccountActionProcessor extends BaseActionProcessor {
    /**
     * Get Service Account user associated with the client
     * @param adminClient
     * @param realm
     * @param clientId
     */
    async getServiceAccountUser(adminClient: KeycloakClient, realm: string, client: any) {
        if (!client.serviceAccountsEnabled) {
            throw new ActionError(
                `ServiceAccount is not enabled for client with clientId "${client.clientId}" of realm "${realm}"`,
                '500',
            );
        }

        this.snapshot.log(`[realm=${realm}] [clientId=${client.clientId}] Looking for service account user.`);
        const user = await adminClient.clients.getServiceAccountUser(realm, client.id);
        this.snapshot.log(`[realm=${realm}] [clientId=${client.clientId}] Service account user successfully loaded.`);

        return user;
    }
}
