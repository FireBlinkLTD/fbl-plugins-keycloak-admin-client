import KeycloakAdminClient from 'keycloak-admin';
import MappingsRepresentation from 'keycloak-admin/lib/defs/mappingsRepresentation';
import { BaseGroupActionProcessor } from '../../BaseGroupActionProcessor';

export abstract class BaseGroupMappingsActionProcessor extends BaseGroupActionProcessor {
    /**
     * Find group role mappings
     * @param adminClient
     * @param groupId
     * @param realmName
     */
    async findRoleMappings(
        adminClient: KeycloakAdminClient,
        groupId: string,
        realmName: string,
    ): Promise<MappingsRepresentation> {
        return await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.groups.listRoleMappings({
                id: groupId,
                realm: realmName,
            });
        });
    }
}
