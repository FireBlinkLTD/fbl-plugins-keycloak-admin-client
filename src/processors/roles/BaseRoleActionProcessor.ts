import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import KeycloakAdminClient from 'keycloak-admin';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';
import { ICompositeRoleRepresentation, ICompositeRoleMappingRepresentation } from '../../interfaces';

export abstract class BaseRoleActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    /**
     * Find composite roles
     * @param adminClient
     * @param realm
     * @param roles
     */
    async findCompositeRoles(
        adminClient: KeycloakAdminClient,
        realm: string,
        roles?: ICompositeRoleRepresentation,
    ): Promise<ICompositeRoleMappingRepresentation> {
        const result: ICompositeRoleMappingRepresentation = {
            realm: [],
            client: {},
        };

        /* istanbul ignore else */
        if (roles) {
            /* istanbul ignore else */
            if (roles.realm) {
                for (const name of roles.realm) {
                    const roleRepresentation = await adminClient.roles.findOneByName({
                        name,
                        realm,
                    });

                    result.realm.push(roleRepresentation);
                }
            }

            /* istanbul ignore else */
            if (roles.client) {
                for (const clientId of Object.keys(roles.client)) {
                    const client = await this.findClient(adminClient, realm, clientId);
                    result.client[clientId] = [];
                    for (const name of roles.client[clientId]) {
                        const roleRepresentation = await adminClient.clients.findRole({
                            id: client.id,
                            roleName: name,
                            realm,
                        });

                        result.client[clientId].push(roleRepresentation);
                    }
                }
            }
        }

        return result;
    }

    /**
     * Get composite roles mapping
     * @param adminClient
     * @param realm
     * @param parentRole
     * @param childRole
     */
    async getCompositeRoles(
        adminClient: KeycloakAdminClient,
        realm: string,
        parentRole: RoleRepresentation,
    ): Promise<ICompositeRoleRepresentation> {
        const response: RoleRepresentation[] = await this.get(
            adminClient,
            `/admin/realms/${realm}/roles-by-id/${parentRole.id}/composites`,
        );

        const result: ICompositeRoleRepresentation = {
            realm: [],
            client: {},
        };

        const clientMapping: { [id: string]: string } = {};

        for (const role of response) {
            if (role.clientRole) {
                if (!clientMapping[role.containerId]) {
                    const client = await adminClient.clients.findOne({
                        id: role.containerId,
                        realm,
                    });

                    clientMapping[role.containerId] = client.clientId;
                }

                const clientId = clientMapping[role.containerId];

                if (!result.client[clientId]) {
                    result.client[clientId] = [];
                }

                result.client[clientId].push(role.name);
            } else {
                result.realm.push(role.name);
            }
        }

        return result;
    }

    /**
     * Add composite roles mapping
     * @param adminClient
     * @param realm
     * @param parentRole
     * @param childRole
     */
    async addCompositeRoles(
        adminClient: KeycloakAdminClient,
        realm: string,
        parentRole: RoleRepresentation,
        childRoles: RoleRepresentation[],
    ) {
        if (childRoles.length) {
            await this.post(adminClient, `/admin/realms/${realm}/roles-by-id/${parentRole.id}/composites`, childRoles);
        }
    }

    /**
     * Remove composite roles mapping
     * @param adminClient
     * @param realm
     * @param parentRole
     * @param childRole
     */
    async removeCompositeRoles(
        adminClient: KeycloakAdminClient,
        realm: string,
        parentRole: RoleRepresentation,
        childRoles: RoleRepresentation[],
    ) {
        if (childRoles.length) {
            await this.delete(
                adminClient,
                `/admin/realms/${realm}/roles-by-id/${parentRole.id}/composites`,
                childRoles,
            );
        }
    }

    /**
     * Apply composite roles
     * @param adminClient
     * @param realm
     * @param parentRole
     * @param composites
     */
    async applyCompositeRoles(
        adminClient: KeycloakAdminClient,
        realm: string,
        parentRole: RoleRepresentation,
        composites?: ICompositeRoleRepresentation,
    ): Promise<void> {
        let compositeRolesToAdd: ICompositeRoleRepresentation = {
            realm: [],
            client: {},
        };

        let compositeRolesToRemove: ICompositeRoleRepresentation = {
            realm: [],
            client: {},
        };

        if (composites && !parentRole.composites) {
            compositeRolesToAdd = composites;
        }

        if (!composites && parentRole.composites) {
            compositeRolesToRemove = parentRole.composites;
        }

        if (composites && parentRole.composites) {
            /* istanbul ignore next */
            const compositesRealm = composites.realm || [];
            /* istanbul ignore next */
            const parentRoleRealm = parentRole.composites.realm || [];

            for (const realmRoleName of compositesRealm) {
                if (parentRoleRealm.indexOf(realmRoleName) < 0) {
                    compositeRolesToAdd.realm.push(realmRoleName);
                }
            }

            for (const realmRoleName of parentRoleRealm) {
                if (compositesRealm.indexOf(realmRoleName) < 0) {
                    compositeRolesToRemove.realm.push(realmRoleName);
                }
            }

            /* istanbul ignore next */
            const compositesClient = composites.client || {};
            /* istanbul ignore next */
            const parentRoleClient = parentRole.composites.client || {};

            for (const clientId of Object.keys(compositesClient)) {
                if (!parentRoleClient[clientId]) {
                    compositeRolesToAdd.client[clientId] = compositesClient[clientId];
                } else {
                    const parentRoles = parentRoleClient[clientId];
                    for (const roleName of compositesClient[clientId]) {
                        /* istanbul ignore else */
                        if (parentRoles.indexOf(roleName) < 0) {
                            /* istanbul ignore else */
                            if (!compositeRolesToAdd.client[clientId]) {
                                compositeRolesToAdd.client[clientId] = [];
                            }

                            compositeRolesToAdd.client[clientId].push(roleName);
                        }
                    }
                }
            }

            for (const clientId of Object.keys(parentRoleClient)) {
                if (!compositesClient[clientId]) {
                    compositeRolesToRemove.client[clientId] = parentRoleClient[clientId];
                } else {
                    const childRoles = compositesClient[clientId];
                    for (const roleName of parentRoleClient[clientId]) {
                        /* istanbul ignore else */
                        if (childRoles.indexOf(roleName) < 0) {
                            /* istanbul ignore else */
                            if (!compositeRolesToRemove.client[clientId]) {
                                compositeRolesToRemove.client[clientId] = [];
                            }

                            compositeRolesToRemove.client[clientId].push(roleName);
                        }
                    }
                }
            }
        }

        const compositeRolesMappingToAdd = await this.findCompositeRoles(adminClient, realm, compositeRolesToAdd);
        const compositeRolesMappingToRemove = await this.findCompositeRoles(adminClient, realm, compositeRolesToRemove);

        const toAdd = [...compositeRolesMappingToAdd.realm];
        for (const clientId of Object.keys(compositeRolesMappingToAdd.client)) {
            toAdd.push(...compositeRolesMappingToAdd.client[clientId]);
        }

        const toRemove = [...compositeRolesMappingToRemove.realm];
        for (const clientId of Object.keys(compositeRolesMappingToRemove.client)) {
            toRemove.push(...compositeRolesMappingToRemove.client[clientId]);
        }

        await this.addCompositeRoles(adminClient, realm, parentRole, toAdd);
        await this.removeCompositeRoles(adminClient, realm, parentRole, toRemove);
    }
}
