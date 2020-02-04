import { ActionError, ActionProcessor } from 'fbl';
import UserRepresentation from 'keycloak-admin/lib/defs/userRepresentation';
import { KeycloakClient } from '../../helpers/KeycloakClient';
import { BaseActionProcessor } from '../base';

export abstract class BaseUserActionProcessor extends BaseActionProcessor {
    /**
     * Find realm roles
     * @param adminClient
     * @param roles
     * @param realmName
     */
    async findUser(
        adminClient: KeycloakClient,
        realmName: string,
        username?: string,
        email?: string,
    ): Promise<UserRepresentation> {
        let logPreffix = `[realm=${realmName}] `;

        if (username) {
            logPreffix += `[username=${username}] `;
        }

        if (email) {
            logPreffix += `[email=${email}] `;
        }

        this.snapshot.log(`${logPreffix}Looking for a user.`);
        const users = await adminClient.users.find(realmName, {
            username: username,
            email: email,
            max: 1,
        });

        if (!users.length) {
            throw new ActionError(`Unable to find user "${username || email}" in realm "${realmName}"`, '404');
        }

        this.snapshot.log(`${logPreffix}User found.`);

        return users[0];
    }
}
