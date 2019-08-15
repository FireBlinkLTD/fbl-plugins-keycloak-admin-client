import { BaseGroupMappingsActionProcessor } from '../BaseGroupMappingsActionProcessor';
import KeycloakAdminClient from 'keycloak-admin';
import MappingsRepresentation from 'keycloak-admin/lib/defs/mappingsRepresentation';
import RoleRepresentation, { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import { ActionError } from 'fbl';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';

export abstract class BaseGroupClientRoleMappingsActionProcessor extends BaseGroupMappingsActionProcessor {
    /**
     * Find client
     * @param adminClient
     * @param clientId
     * @param realmName
     */
    async findClient(
        adminClient: KeycloakAdminClient,
        clientId: string,
        realmName: string,
    ): Promise<ClientRepresentation> {
        const clients = await adminClient.clients.find({
            clientId,
            realm: realmName,
        });

        if (!clients.length) {
            throw new ActionError(`Unable to find client "${clientId}" in realm "${realmName}".`, '404');
        }

        return clients[0];
    }

    /**
     * Find existing client roles
     * @param adminClient
     * @param realmName
     * @param clientUniqueId
     * @param roles
     */
    async getClientRoles(
        adminClient: KeycloakAdminClient,
        realmName: string,
        clientUniqueId: string,
        roles: string[],
    ): Promise<RoleRepresentation[]> {
        return await this.wrapKeycloakAdminRequest(async () => {
            const clientRoles = await adminClient.clients.listRoles({
                id: clientUniqueId,
                realm: realmName,
            });

            return clientRoles.filter(r => roles.indexOf(r.name) >= 0);
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
        client: ClientRepresentation,
        realmName: string,
        rolesToAdd: string[],
        mappings: MappingsRepresentation,
    ): Promise<void> {
        if (mappings.clientMappings && mappings.clientMappings[client.clientId]) {
            rolesToAdd = rolesToAdd.filter((r: string) => {
                return !mappings.clientMappings[client.clientId].mappings.find(
                    (role: RoleRepresentation) => role.name === r,
                );
            });
        }

        const roleMappingsToAdd = <RoleMappingPayload[]>(
            await this.getClientRoles(adminClient, realmName, client.id, rolesToAdd)
        );

        /* istanbul ignore else */
        if (rolesToAdd.length) {
            this.snapshot.log(`Adding client "${client.clientId}" role mappings for: ` + rolesToAdd.join(', '));
            await this.wrapKeycloakAdminRequest(async () => {
                await adminClient.groups.addClientRoleMappings({
                    id: groupId,
                    clientUniqueId: client.id,
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
        client: ClientRepresentation,
        realmName: string,
        rolesToRemove: string[],
        mappings: MappingsRepresentation,
    ): Promise<void> {
        let rolesRepresentationsToRemove: RoleRepresentation[] = [];
        /* istanbul ignore else */
        if (mappings.clientMappings && mappings.clientMappings[client.clientId]) {
            rolesRepresentationsToRemove = mappings.clientMappings[client.clientId].mappings.filter(
                (r: RoleRepresentation) => {
                    return rolesToRemove.indexOf(r.name) >= 0;
                },
            );
        }

        /* istanbul ignore else */
        if (rolesRepresentationsToRemove.length) {
            this.snapshot.log(
                `Removing client "${client.clientId}" role mappings for: ` +
                    rolesRepresentationsToRemove.map(r => r.name).join(', '),
            );
            await this.wrapKeycloakAdminRequest(async () => {
                await adminClient.groups.delClientRoleMappings({
                    id: groupId,
                    clientUniqueId: client.id,
                    realm: realmName,
                    roles: <RoleMappingPayload[]>rolesRepresentationsToRemove,
                });
            });
        }
    }
}
