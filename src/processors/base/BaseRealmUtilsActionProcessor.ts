import { BaseConnectionActionProcessor } from './BaseConnectionActionProcessor';
import RoleRepresentation, { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import { ICompositeRoleRepresentation } from '../../interfaces';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import KeycloakAdminClient from 'keycloak-admin';
import { ActionError } from 'fbl';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';

export abstract class BaseRealmUtilsActionProcessor extends BaseConnectionActionProcessor {
    /**
     * Find realm roles
     *
     * @param adminClient
     * @param roles
     * @param realmName
     */
    async getRealmRoles(
        adminClient: KeycloakAdminClient,
        roles: string[],
        realmName: string,
    ): Promise<RoleRepresentation[]> {
        this.snapshot.log(`[realm=${realmName}] Loading realm roles: ${roles.join(',')}`);
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

        this.snapshot.log(`[realm=${realmName}] Realm roles loaded: ${roles.join(',')}`);

        return realmRoles;
    }

    /**
     * Add Realm Role mappings
     *
     * @param adminClient
     * @param user
     * @param realmName
     * @param rolesToAdd
     * @param mappings
     */
    async addRealmRoleMappingsForUser(
        adminClient: KeycloakAdminClient,
        user: UserRepresentation,
        realmName: string,
        rolesToAdd: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        rolesToAdd = rolesToAdd.filter((r: string) => {
            return mappings.realm.indexOf(r) <= 0;
        });

        const roleMappingsToAdd = <RoleMappingPayload[]>await this.getRealmRoles(adminClient, rolesToAdd, realmName);

        /* istanbul ignore else */
        if (rolesToAdd.length) {
            this.snapshot.log(`[realm=${realmName}] Adding realm role mappings for: ` + rolesToAdd.join(', '));
            await adminClient.users.addRealmRoleMappings({
                id: user.id,
                realm: realmName,
                roles: roleMappingsToAdd,
            });
            this.snapshot.log(`[realm=${realmName}] Added realm role mappings for: ` + rolesToAdd.join(', '));
        }
    }

    /**
     * Delete Realm Role mappings
     *
     * @param adminClient
     * @param user
     * @param realmName
     * @param rolesToRemove
     * @param mappings
     */
    async deleteRealmRoleMappingsForUser(
        adminClient: KeycloakAdminClient,
        user: UserRepresentation,
        realmName: string,
        rolesToRemove: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        rolesToRemove = mappings.realm.filter((r: string) => {
            return rolesToRemove.indexOf(r) >= 0;
        });

        /* istanbul ignore else */
        if (rolesToRemove.length) {
            const roles = await this.getRealmRoles(adminClient, rolesToRemove, realmName);

            this.snapshot.log(`[realm=${realmName}] Removing realm role mappings for: ` + rolesToRemove.join(', '));
            await adminClient.users.delRealmRoleMappings({
                id: user.id,
                realm: realmName,
                roles: <RoleMappingPayload[]>roles,
            });
            this.snapshot.log(`[realm=${realmName}] Removed realm role mappings for: ` + rolesToRemove.join(', '));
        }
    }

    /**
     * Add Realm Role mappings
     *
     * @param adminClient
     * @param group
     * @param realmName
     * @param rolesToAdd
     * @param mappings
     */
    async addRealmRoleMappingsForGroup(
        adminClient: KeycloakAdminClient,
        group: GroupRepresentation,
        realmName: string,
        rolesToAdd: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        rolesToAdd = rolesToAdd.filter((r: string) => {
            return mappings.realm.indexOf(r) <= 0;
        });

        /* istanbul ignore else */
        if (rolesToAdd.length) {
            const roleMappingsToAdd = <RoleMappingPayload[]>(
                await this.getRealmRoles(adminClient, rolesToAdd, realmName)
            );

            this.snapshot.log(`[realm=${realmName}] Adding realm role mappings for: ` + rolesToAdd.join(', '));
            await adminClient.groups.addRealmRoleMappings({
                id: group.id,
                realm: realmName,
                roles: roleMappingsToAdd,
            });
            this.snapshot.log(`[realm=${realmName}] Added realm role mappings for: ` + rolesToAdd.join(', '));
        }
    }

    /**
     * Delete Realm Role mappings
     *
     * @param adminClient
     * @param group
     * @param realmName
     * @param rolesToRemove
     * @param mappings
     */
    async deleteRealmRoleMappingsForGroup(
        adminClient: KeycloakAdminClient,
        group: GroupRepresentation,
        realmName: string,
        rolesToRemove: string[],
        mappings: ICompositeRoleRepresentation,
    ): Promise<void> {
        rolesToRemove = mappings.realm.filter((r: string) => {
            return rolesToRemove.indexOf(r) >= 0;
        });

        /* istanbul ignore else */
        if (rolesToRemove.length) {
            const roles = await this.getRealmRoles(adminClient, rolesToRemove, realmName);

            this.snapshot.log(`[realm=${realmName}] Removing realm role mappings for: ` + rolesToRemove.join(', '));
            await adminClient.groups.delRealmRoleMappings({
                id: group.id,
                realm: realmName,
                roles: <RoleMappingPayload[]>roles,
            });
            this.snapshot.log(`[realm=${realmName}] Removed realm role mappings for: ` + rolesToRemove.join(', '));
        }
    }
}
