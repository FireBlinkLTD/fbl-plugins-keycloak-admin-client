import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { ActionError } from 'fbl';
import KeycloakAdminClient from 'keycloak-admin';

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
}
