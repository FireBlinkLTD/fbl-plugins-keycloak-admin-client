import { ICompositeRoleRepresentation } from '../../interfaces';
import { ActionError } from 'fbl';
import { BaseClientUtilsActionProcessor } from './BaseClientUtilsActionProcessor';
import { KeycloakClient } from '../../helpers/KeycloakClient';

export abstract class BaseGroupUtilsActionProcessor extends BaseClientUtilsActionProcessor {
    /**
     * Find group by name
     * @param adminClient
     * @param realm
     * @param groupName
     */
    async findGroup(adminClient: KeycloakClient, realm: string, groupName: string) {
        this.snapshot.log(`[realm=${realm}] [group=${groupName}] Looking for group.`);
        // search will return all groups that contain the name, so we need to filter by exact match later
        const groups = await adminClient.groups.find(realm, {
            search: groupName,
        });

        const exactGroup = groups.find((g: any) => g.name === groupName);
        if (!exactGroup) {
            throw new ActionError(`Unable to find group "${groupName}" in realm "${realm}".`, '404');
        }

        this.snapshot.log(`[realm=${realm}] [group=${groupName}] Group found.`);

        return exactGroup;
    }

    /**
     * Find group role mappings
     * @param adminClient
     * @param group
     * @param realmName
     */
    async findGroupRoleMappings(
        adminClient: KeycloakClient,
        group: any,
        realmName: string,
    ): Promise<ICompositeRoleRepresentation> {
        this.snapshot.log(`[realm=${realmName}] [group=${group.name}] Looking for group role mappings.`);
        const mappings = await adminClient.groups.listRoleMappings(realmName, group.id);
        this.snapshot.log(`[realm=${realmName}] [group=${group.name}] Group role mappings loaded.`);

        const result: ICompositeRoleRepresentation = {
            realm: [],
            client: {},
        };

        if (mappings.realmMappings) {
            result.realm = mappings.realmMappings.map((r: any) => r.name);
        }

        /* istanbul ignore else */
        if (mappings.clientMappings) {
            for (const clientId of Object.keys(mappings.clientMappings)) {
                result.client[clientId] = mappings.clientMappings[clientId].mappings.map((r: any) => r.name);
            }
        }

        return result;
    }
}
