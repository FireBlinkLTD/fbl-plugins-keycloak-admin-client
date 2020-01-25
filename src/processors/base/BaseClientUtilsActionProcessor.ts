import RoleRepresentation, { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import { ICompositeRoleRepresentation } from '../../interfaces';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import KeycloakAdminClient from 'keycloak-admin';
import { ActionError } from 'fbl';
import { BaseRealmUtilsActionProcessor } from './BaseRealmUtilsActionProcessor';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';

export abstract class BaseClientUtilsActionProcessor extends BaseRealmUtilsActionProcessor {
    /**
     * Find client
     * @param adminClient
     * @param realm
     * @param clientId
     */
    async findClient(adminClient: KeycloakAdminClient, realm: string, clientId: string): Promise<ClientRepresentation> {
        const clients = await adminClient.clients.find({
            clientId,
            realm,
        });

        if (!clients.length) {
            throw new ActionError(`Client with clientId "${clientId}" of realm "${realm}" not found`, '404');
        }

        return clients[0];
    }

    /**
     * Find existing client RoleRepresentations matching given list of role names
     * @param adminClient
     * @param realmName
     * @param clientUniqueId
     * @param roles
     */
    async getClientRoles(
        adminClient: KeycloakAdminClient,
        realmName: string,
        client: ClientRepresentation,
        roles: string[],
    ): Promise<RoleRepresentation[]> {
        const clientRoles = await adminClient.clients.listRoles({
            id: client.id,
            realm: realmName,
        });

        return clientRoles.filter(r => roles.indexOf(r.name) >= 0);
    }

    /**
     * Add client role mappings
     *
     * @param adminClient
     * @param user
     * @param client
     * @param realmName
     * @param rolesToAdd
     * @param mappings
     */
    async addClientRoleMappingsForUser(
        adminClient: KeycloakAdminClient,
        user: UserRepresentation,
        client: ClientRepresentation,
        realmName: string,
        rolesToAdd: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        if (mappings.client[client.clientId]) {
            rolesToAdd = rolesToAdd.filter((r: string) => {
                return mappings.client[client.clientId].indexOf(r) < 0;
            });
        }

        const roleMappingsToAdd = <RoleMappingPayload[]>(
            await this.getClientRoles(adminClient, realmName, client, rolesToAdd)
        );

        /* istanbul ignore else */
        if (rolesToAdd.length) {
            this.snapshot.log(`Adding client "${client.clientId}" role mappings for: ` + rolesToAdd.join(', '));
            await adminClient.users.addClientRoleMappings({
                id: user.id,
                clientUniqueId: client.id,
                realm: realmName,
                roles: roleMappingsToAdd,
            });
        }
    }

    /**
     * Delete client role mappings
     *
     * @param adminClient
     * @param user
     * @param client
     * @param realmName
     * @param rolesToRemove
     * @param mappings
     */
    async deleteClientRoleMappingsForUser(
        adminClient: KeycloakAdminClient,
        user: UserRepresentation,
        client: ClientRepresentation,
        realmName: string,
        rolesToRemove: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        /* istanbul ignore else */
        if (mappings.client[client.clientId]) {
            rolesToRemove = mappings.client[client.clientId].filter(r => rolesToRemove.indexOf(r) >= 0);
        }

        /* istanbul ignore else */
        if (rolesToRemove.length) {
            this.snapshot.log(`Removing client "${client.clientId}" role mappings for: ` + rolesToRemove.join(', '));

            const roles = await this.getClientRoles(adminClient, realmName, client, rolesToRemove);

            await adminClient.users.delClientRoleMappings({
                id: user.id,
                clientUniqueId: client.id,
                realm: realmName,
                roles: <RoleMappingPayload[]>roles,
            });
        }
    }

    /**
     * Add client role mappings
     *
     * @param adminClient
     * @param group
     * @param client
     * @param realmName
     * @param rolesToAdd
     * @param mappings
     */
    async addClientRoleMappingsForGroup(
        adminClient: KeycloakAdminClient,
        group: GroupRepresentation,
        client: ClientRepresentation,
        realmName: string,
        rolesToAdd: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        if (mappings.client[client.clientId]) {
            rolesToAdd = rolesToAdd.filter((r: string) => {
                return mappings.client[client.clientId].indexOf(r) < 0;
            });
        }

        /* istanbul ignore else */
        if (rolesToAdd.length) {
            this.snapshot.log(`Adding client "${client.clientId}" role mappings for: ` + rolesToAdd.join(', '));
            const roleMappingsToAdd = <RoleMappingPayload[]>(
                await this.getClientRoles(adminClient, realmName, client, rolesToAdd)
            );

            await adminClient.groups.addClientRoleMappings({
                id: group.id,
                clientUniqueId: client.id,
                realm: realmName,
                roles: roleMappingsToAdd,
            });
        }
    }

    /**
     * Delete client role mappings
     *
     * @param adminClient
     * @param group
     * @param client
     * @param realmName
     * @param rolesToRemove
     * @param mappings
     */
    async deleteClientRoleMappingsForGroup(
        adminClient: KeycloakAdminClient,
        group: GroupRepresentation,
        client: ClientRepresentation,
        realmName: string,
        rolesToRemove: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        /* istanbul ignore else */
        if (mappings.client[client.clientId]) {
            rolesToRemove = mappings.client[client.clientId].filter(r => rolesToRemove.indexOf(r) >= 0);
        }

        /* istanbul ignore else */
        if (rolesToRemove.length) {
            this.snapshot.log(`Removing client "${client.clientId}" role mappings for: ` + rolesToRemove.join(', '));
            const roles = await this.getClientRoles(adminClient, realmName, client, rolesToRemove);

            await adminClient.groups.delClientRoleMappings({
                id: group.id,
                clientUniqueId: client.id,
                realm: realmName,
                roles: <RoleMappingPayload[]>roles,
            });
        }
    }
}
