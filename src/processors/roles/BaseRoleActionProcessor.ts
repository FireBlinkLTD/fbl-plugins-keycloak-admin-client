import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';
import { ICompositeRoleRepresentation, ICompositeRoleMappingRepresentation } from '../../interfaces';
import { KeycloakClient } from '../../helpers/KeycloakClient';
import { BaseActionProcessor } from '../base';

export abstract class BaseRoleActionProcessor extends BaseActionProcessor {
    /**
     * Find composite roles
     * @param adminClient
     * @param realm
     * @param roles
     */
    async findCompositeRoles(
        adminClient: KeycloakClient,
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
                    this.snapshot.log(`[realm=${realm}] Loading role ${name}.`);
                    const roleRepresentation = await adminClient.roles.findOne(realm, name);
                    this.snapshot.log(`[realm=${realm}] Role ${name} loaded.`);

                    result.realm.push(roleRepresentation);
                }
            }

            /* istanbul ignore else */
            if (roles.client) {
                for (const clientId of Object.keys(roles.client)) {
                    const client = await this.findClient(adminClient, realm, clientId);
                    result.client[clientId] = [];
                    for (const name of roles.client[clientId]) {
                        this.snapshot.log(`[realm=${realm}] [clientId=${clientId}] Loading role ${name}.`);
                        const roleRepresentation = await adminClient.clients.findRole(realm, client.id, name);
                        this.snapshot.log(`[realm=${realm}] [clientId=${clientId}] Role ${name} loaded.`);

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
        adminClient: KeycloakClient,
        realm: string,
        parentRole: RoleRepresentation,
    ): Promise<ICompositeRoleRepresentation> {
        this.snapshot.log(`[realm=${realm}] Loading role ${parentRole.name} composites.`);
        const response: RoleRepresentation[] = await adminClient.get(
            `/admin/realms/${realm}/roles-by-id/${parentRole.id}/composites`,
        );
        this.snapshot.log(`[realm=${realm}] Role ${parentRole.name} composites successfully loaded.`);

        const result: ICompositeRoleRepresentation = {
            realm: [],
            client: {},
        };

        const clientMapping: { [id: string]: string } = {};

        for (const role of response) {
            if (role.clientRole) {
                if (!clientMapping[role.containerId]) {
                    this.snapshot.log(`[realm=${realm}] Loading client.`);
                    const client = await adminClient.clients.findOne(realm, role.containerId);
                    this.snapshot.log(`[realm=${realm}] Client ${client.clientId} successfully loaded.`);

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
        adminClient: KeycloakClient,
        realm: string,
        parentRole: RoleRepresentation,
        childRoles: RoleRepresentation[],
    ) {
        if (childRoles.length) {
            this.snapshot.log(`[realm=${realm}] Adding composite roles.`);
            await adminClient.post(`/admin/realms/${realm}/roles-by-id/${parentRole.id}/composites`, childRoles);
            this.snapshot.log(`[realm=${realm}] Composite roles successully added.`);
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
        adminClient: KeycloakClient,
        realm: string,
        parentRole: RoleRepresentation,
        childRoles: RoleRepresentation[],
    ) {
        if (childRoles.length) {
            this.snapshot.log(`[realm=${realm}] Removing composite roles.`);
            await adminClient.delete(`/admin/realms/${realm}/roles-by-id/${parentRole.id}/composites`, {}, childRoles);
            this.snapshot.log(`[realm=${realm}] Composite roles successfully removed.`);
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
        adminClient: KeycloakClient,
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
