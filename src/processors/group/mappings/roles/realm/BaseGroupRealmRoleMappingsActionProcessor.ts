import { BaseGroupMappingsActionProcessor } from '../BaseGroupMappingsActionProcessor';
import KeycloakAdminClient from 'keycloak-admin';
import MappingsRepresentation from 'keycloak-admin/lib/defs/mappingsRepresentation';
import RoleRepresentation, { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import { ActionError } from 'fbl';

export abstract class BaseGroupRealmRoleMappingsActionProcessor extends BaseGroupMappingsActionProcessor {
    /**
     * Find realm roles
     * @param adminClient
     * @param roles
     * @param realmName
     */
    async getRealmRoles(
        adminClient: KeycloakAdminClient,
        roles: string[],
        realmName: string,
    ): Promise<RoleRepresentation> {
        return await this.wrapKeycloakAdminRequest(async () => {
            const realmRoles: RoleRepresentation[] = [];

            // unfortunatelly .find method is broken in adminClient, need to get each role one by one
            for (const role of roles) {
                const r = await adminClient.roles.findOneByName({
                    name: role,
                    realm: realmName,
                });

                if (!r) {
                    throw new ActionError(`Unable to find realm role "${role}" in realm "${realmName}".`, '404');
                }
                realmRoles.push(r);
            }

            return realmRoles;
        });
    }

    /**
     * Add Realm Role mappings
     * @param adminClient
     * @param groupId
     * @param realmName
     * @param rolesToAdd
     * @param mappings
     */
    async addRoleMappings(
        adminClient: KeycloakAdminClient,
        groupId: string,
        realmName: string,
        rolesToAdd: string[],
        mappings: MappingsRepresentation,
    ): Promise<void> {
        if (mappings.realmMappings) {
            rolesToAdd = rolesToAdd.filter((r: string) => {
                return !mappings.realmMappings.find(role => role.name === r);
            });
        }

        const roleMappingsToAdd = <RoleMappingPayload[]>await this.getRealmRoles(adminClient, rolesToAdd, realmName);

        /* istanbul ignore else */
        if (rolesToAdd.length) {
            this.snapshot.log('Adding realm role mappings for: ' + rolesToAdd.join(', '));
            await this.wrapKeycloakAdminRequest(async () => {
                await adminClient.groups.addRealmRoleMappings({
                    id: groupId,
                    realm: realmName,
                    roles: roleMappingsToAdd,
                });
            });
        }
    }

    /**
     * Delete Realm Role mappings
     * @param adminClient
     * @param groupId
     * @param realmName
     * @param rolesToRemove
     * @param mappings
     */
    async deleteRoleMappings(
        adminClient: KeycloakAdminClient,
        groupId: string,
        realmName: string,
        rolesToRemove: string[],
        mappings: MappingsRepresentation,
    ): Promise<void> {
        let rolesRepresentationsToRemove: RoleRepresentation[] = [];

        /* istanbul ignore else */
        if (mappings.realmMappings) {
            rolesRepresentationsToRemove = mappings.realmMappings.filter((r: RoleRepresentation) => {
                return rolesToRemove.indexOf(r.name) >= 0;
            });
        }

        /* istanbul ignore else */
        if (rolesRepresentationsToRemove.length) {
            this.snapshot.log(
                'Removing realm role mappings for: ' + rolesRepresentationsToRemove.map(r => r.name).join(', '),
            );
            await this.wrapKeycloakAdminRequest(async () => {
                await adminClient.groups.delRealmRoleMappings({
                    id: groupId,
                    realm: realmName,
                    roles: <RoleMappingPayload[]>rolesRepresentationsToRemove,
                });
            });
        }
    }
}
