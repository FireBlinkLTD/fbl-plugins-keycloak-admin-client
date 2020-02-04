import RoleRepresentation, { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import { ICompositeRoleRepresentation } from '../../interfaces';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { ActionError } from 'fbl';
import { BaseRealmUtilsActionProcessor } from './BaseRealmUtilsActionProcessor';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import { KeycloakClient } from '../../helpers/KeycloakClient';

export abstract class BaseClientUtilsActionProcessor extends BaseRealmUtilsActionProcessor {
    /**
     * Find client
     * @param adminClient
     * @param realm
     * @param clientId
     */
    async findClient(adminClient: KeycloakClient, realm: string, clientId: string): Promise<ClientRepresentation> {
        this.snapshot.log(`[realm=${realm}] [clientId=${clientId}] Looking for a client.`);
        const clients = await adminClient.clients.find(realm, { clientId });

        if (!clients.length) {
            throw new ActionError(`Client with clientId "${clientId}" of realm "${realm}" not found`, '404');
        }
        this.snapshot.log(`[realm=${realm}] [clientId=${clientId}] Client successfully loaded.`);

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
        adminClient: KeycloakClient,
        realmName: string,
        client: ClientRepresentation,
        roles: string[],
    ): Promise<RoleRepresentation[]> {
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Looking for client roles.`);
        const clientRoles = await adminClient.clients.listRoles(realmName, client.id);

        const filteredRoles = clientRoles.filter((r: any) => roles.indexOf(r.name) >= 0);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Found ${filteredRoles.length} roles.`);

        return filteredRoles;
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
        adminClient: KeycloakClient,
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
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Adding role mappings for: ` + rolesToAdd.join(', '),
            );
            await adminClient.users.addClientRoleMappings(realmName, user.id, client.id, roleMappingsToAdd);
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Added role mappings for: ` + rolesToAdd.join(', '),
            );
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
        adminClient: KeycloakClient,
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
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Removing client role mappings for: ` +
                    rolesToRemove.join(', '),
            );

            const roles = await this.getClientRoles(adminClient, realmName, client, rolesToRemove);

            await adminClient.users.delClientRoleMappings(realmName, user.id, client.id, roles);
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Removed client role mappings for: ` +
                    rolesToRemove.join(', '),
            );
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
        adminClient: KeycloakClient,
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
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Adding client role mappings for: ` +
                    rolesToAdd.join(', '),
            );
            const roleMappingsToAdd = <RoleMappingPayload[]>(
                await this.getClientRoles(adminClient, realmName, client, rolesToAdd)
            );

            await adminClient.groups.addClientRoleMappings(realmName, group.id, client.id, roleMappingsToAdd);
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Added client role mappings for: ` +
                    rolesToAdd.join(', '),
            );
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
        adminClient: KeycloakClient,
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
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Removing client role mappings for: ` +
                    rolesToRemove.join(', '),
            );
            const roles = await this.getClientRoles(adminClient, realmName, client, rolesToRemove);

            await adminClient.groups.delClientRoleMappings(realmName, group.id, client.id, roles);
            this.snapshot.log(
                `[realm=${realmName}] [clientId=${client.clientId}] Removed client role mappings for: ` +
                    rolesToRemove.join(', '),
            );
        }
    }
}
