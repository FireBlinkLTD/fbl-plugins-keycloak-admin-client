import { BaseUserActionProcessor } from '../../BaseUserActionProcessor';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import { ActionError } from 'fbl';
import { KeycloakClient } from '../../../../helpers/KeycloakClient';

export abstract class BaseUserGroupActionProcessor extends BaseUserActionProcessor {
    /**
     * Find group by name
     */
    async findGroup(adminClient: KeycloakClient, realm: string, groupName: string): Promise<GroupRepresentation> {
        // search will return all groups that contain the name, so we need to filter by exact match later
        this.snapshot.log(`[realm=${realm}] [group=${groupName}] Loading group.`);
        const groups = await adminClient.groups.find(realm, {
            search: groupName,
        });

        const exactGroup = groups.find((g: GroupRepresentation) => g.name === groupName);
        if (!exactGroup) {
            throw new ActionError(`Unable to find group "${groupName}" in realm "${realm}".`, '404');
        }
        this.snapshot.log(`[realm=${realm}] [group=${groupName}] Group found.`);

        return exactGroup;
    }
}
