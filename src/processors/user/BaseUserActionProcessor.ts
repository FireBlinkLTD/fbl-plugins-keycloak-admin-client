import KeycloakAdminClient from 'keycloak-admin';
import { ActionError } from 'fbl';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';

export abstract class BaseUserActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    /**
     * Find realm roles
     * @param adminClient
     * @param roles
     * @param realmName
     */
    async findUser(
        adminClient: KeycloakAdminClient,
        realmName: string,
        username?: string,
        email?: string,
    ): Promise<UserRepresentation> {
        return await this.wrapKeycloakAdminRequest(async () => {
            const users = await adminClient.users.find({
                realm: realmName,
                username: username,
                email: email,
                max: 1,
            });

            if (!users.length) {
                throw new ActionError(`Unable to find user "${username || email}" in realm "${realmName}"`, '404');
            }

            return users[0];
        });
    }
}
