import KeycloakAdminClient from 'keycloak-admin';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { ICompositeRoleRepresentation } from '../../interfaces';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';
import { BaseGroupUtilsActionProcessor } from './BaseGroupUtilActionProcessor';

export abstract class BaseUserUtilsActionProcessor extends BaseGroupUtilsActionProcessor {
    /**
     * Find user role mappings
     * @param adminClient
     * @param user
     * @param realmName
     */
    async findUserRoleMappings(
        adminClient: KeycloakAdminClient,
        user: UserRepresentation,
        realmName: string,
    ): Promise<ICompositeRoleRepresentation> {
        const mappings = await adminClient.users.listRoleMappings({
            id: user.id,
            realm: realmName,
        });

        const result: ICompositeRoleRepresentation = {
            realm: [],
            client: {},
        };

        if (mappings.realmMappings) {
            result.realm = mappings.realmMappings.map(r => r.name);
        }

        /* istanbul ignore else */
        if (mappings.clientMappings) {
            for (const clientId of Object.keys(mappings.clientMappings)) {
                result.client[clientId] = mappings.clientMappings[clientId].mappings.map(
                    (r: RoleRepresentation) => r.name,
                );
            }
        }

        return result;
    }
}
