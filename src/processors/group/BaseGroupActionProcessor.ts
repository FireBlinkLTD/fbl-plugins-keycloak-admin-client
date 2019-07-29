import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { ActionError } from 'fbl';
import KeycloakAdminClient from 'keycloak-admin';
import MappingsRepresentation from 'keycloak-admin/lib/defs/mappingsRepresentation';
import RoleRepresentation, { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';

export abstract class BaseGroupActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    /**
     * Find group by name
     * @param adminClient
     * @param realm
     * @param groupName
     */
    async findGroup(adminClient: KeycloakAdminClient, realm: string, groupName: string): Promise<GroupRepresentation> {
        // search will return all groups that contain the name, so we need to filter by exact match later
        const groups = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.groups.find({
                realm,
                search: groupName,
            });
        });

        const exactGroup = groups.find((g: GroupRepresentation) => g.name === groupName);
        if (!exactGroup) {
            throw new ActionError(`Unable to find group "${groupName}" in realm "${realm}".`, '404');
        }

        return exactGroup;
    }

    /**
     * Update realm roles based on provided mappings
     * @param adminClient
     * @param exactGroup
     * @param roleMappings
     */
    async updateRealmRoles(
        adminClient: KeycloakAdminClient,
        groupId: string,
        realmName: string,
        realmRoles: string[],
        existingRoleMappings: MappingsRepresentation,
    ): Promise<void> {
        if (realmRoles) {
            let rolesToAdd: string[];
            let rolesToRemove: RoleRepresentation[];

            if (!existingRoleMappings.realmMappings) {
                rolesToAdd = realmRoles;
            } else {
                rolesToAdd = realmRoles.filter((r: string) => {
                    return existingRoleMappings.realmMappings.find(role => role.name === r);
                });

                rolesToRemove = existingRoleMappings.realmMappings.filter((r: RoleRepresentation) => {
                    return realmRoles.indexOf(r.name) < 0;
                });
            }

            if (rolesToAdd.length) {
                const roleMappingsToAdd = <RoleMappingPayload[]>(
                    await this.getRealmRoles(adminClient, rolesToAdd, realmName)
                );

                this.snapshot.log('Adding realm role mapping for: ' + rolesToAdd.join(', '));
                await this.wrapKeycloakAdminRequest(async () => {
                    await adminClient.groups.addRealmRoleMappings({
                        id: groupId,
                        realm: realmName,
                        roles: roleMappingsToAdd,
                    });
                });
            }

            if (rolesToRemove) {
                this.snapshot.log('Removing realm role mapping for: ' + rolesToAdd.join(', '));
                await this.wrapKeycloakAdminRequest(async () => {
                    await adminClient.groups.delRealmRoleMappings({
                        id: groupId,
                        realm: realmName,
                        roles: <RoleMappingPayload[]>rolesToRemove,
                    });
                });
            }
        }
    }

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
     * Update client roles
     * @param adminClient
     * @param groupId
     * @param realmName
     * @param clientRoles
     * @param roleMappings
     */
    async updateClientRoles(
        adminClient: KeycloakAdminClient,
        groupId: string,
        realmName: string,
        clientRoles: { [clientId: string]: string[] },
        roleMappings: MappingsRepresentation,
    ): Promise<void> {
        if (clientRoles) {
            for (const clientId of Object.keys(clientRoles)) {
                const exactClientRoles = clientRoles[clientId];
                const client = await this.findClient(adminClient, clientId, realmName);

                let rolesToAdd: string[];
                let rolesToRemove: RoleRepresentation[];

                if (!roleMappings.clientMappings || !roleMappings.clientMappings[clientId]) {
                    rolesToAdd = exactClientRoles;
                } else {
                    rolesToAdd = exactClientRoles.filter((r: string) => {
                        return roleMappings.clientMappings[clientId].find(
                            (role: RoleRepresentation) => role.name === r,
                        );
                    });

                    rolesToRemove = roleMappings.clientMappings[clientId].mappings.filter((r: RoleRepresentation) => {
                        return exactClientRoles.indexOf(r.name) < 0;
                    });
                }

                if (rolesToAdd.length) {
                    const roleMappingsToAdd = <RoleMappingPayload[]>(
                        await this.getClientRoles(adminClient, realmName, client, rolesToAdd)
                    );

                    this.snapshot.log(`Adding client "${clientId}" role mapping for: ` + rolesToAdd.join(', '));
                    await this.wrapKeycloakAdminRequest(async () => {
                        await adminClient.groups.addClientRoleMappings({
                            id: groupId,
                            clientUniqueId: client.id,
                            realm: realmName,
                            roles: roleMappingsToAdd,
                        });
                    });
                }

                if (rolesToRemove) {
                    this.snapshot.log(
                        `Removing client "${clientId}" role mapping for: ` + rolesToRemove.map(r => r.name).join(', '),
                    );
                    await this.wrapKeycloakAdminRequest(async () => {
                        await adminClient.groups.delClientRoleMappings({
                            id: groupId,
                            realm: realmName,
                            clientUniqueId: client.id,
                            roles: <RoleMappingPayload[]>rolesToRemove,
                        });
                    });
                }
            }
        }
    }

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
     * @param client
     * @param roles
     */
    async getClientRoles(
        adminClient: KeycloakAdminClient,
        realmName: string,
        client: ClientRepresentation,
        roles: string[],
    ): Promise<RoleRepresentation> {
        return await this.wrapKeycloakAdminRequest(async () => {
            const clientRoles = await adminClient.clients.listRoles({
                id: client.id,
                realm: realmName,
            });

            return clientRoles.filter(r => roles.indexOf(r.name) >= 0);
        });
    }
}
