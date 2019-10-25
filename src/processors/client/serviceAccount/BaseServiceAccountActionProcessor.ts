import KeycloakAdminClient from 'keycloak-admin';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { ActionError } from 'fbl';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';
import { BaseKeycloakAdminClientActionProcessor } from '../../BaseKeycloakAdminClientActionProcessor';

export abstract class BaseServiceAccountActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    /**
     * Get Service Account user associated with the client
     * @param adminClient
     * @param realm
     * @param clientId
     */
    async getServiceAccountUser(
        adminClient: KeycloakAdminClient,
        realm: string,
        client: ClientRepresentation,
    ): Promise<UserRepresentation> {
        if (!client.serviceAccountsEnabled) {
            throw new ActionError(
                `ServiceAccount is not enabled for client with clientId "${client.clientId}" of realm "${realm}"`,
                '500',
            );
        }

        return await adminClient.clients.getServiceAccountUser({
            id: client.id,
            realm,
        });
    }
}
