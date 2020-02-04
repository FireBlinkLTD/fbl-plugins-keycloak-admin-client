import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { ActionError } from 'fbl';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';
import { BaseKeycloakAdminClientActionProcessor } from '../../BaseKeycloakAdminClientActionProcessor';
import { KeycloakClient } from '../../../helpers/KeycloakClient';

export abstract class BaseServiceAccountActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    /**
     * Get Service Account user associated with the client
     * @param adminClient
     * @param realm
     * @param clientId
     */
    async getServiceAccountUser(
        adminClient: KeycloakClient,
        realm: string,
        client: ClientRepresentation,
    ): Promise<UserRepresentation> {
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
