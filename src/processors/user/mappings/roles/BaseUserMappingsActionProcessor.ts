import KeycloakAdminClient from 'keycloak-admin';
import MappingsRepresentation from 'keycloak-admin/lib/defs/mappingsRepresentation';
import { BaseUserActionProcessor } from '../../BaseUserActionProcessor';

export abstract class BaseUserMappingsActionProcessor extends BaseUserActionProcessor {
    /**
     * Find user role mappings
     * @param adminClient
     * @param userId
     * @param realmName
     */
    async findRoleMappings(
        adminClient: KeycloakAdminClient,
        userId: string,
        realmName: string,
    ): Promise<MappingsRepresentation> {
        return await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.users.listRoleMappings({
                id: userId,
                realm: realmName,
            });
        });
    }
}
