import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseUserGroupActionProcessor } from './BaseUserGroupActionProcessor';

export class UserDeleteFromGroupActionProcessor extends BaseUserGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        groupName: Joi.string()
            .min(1)
            .required(),
    })
        .xor('username', 'email')
        .required()
        .options({
            abortEarly: true,
            allowUnknown: false,
        });

    /**
     * @inheritdoc
     */
    getValidationSchema(): Joi.SchemaLike | null {
        return UserDeleteFromGroupActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, username, email, groupName } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const user = await this.findUser(adminClient, realmName, username, email);
        const group = await this.findGroup(adminClient, realmName, groupName);

        this.snapshot.log(
            `[realm=${realmName}] [username=${user.username}] [group=${groupName}] Removing user from group.`,
        );
        await adminClient.users.deleteFromGroup(realmName, user.id, group.id);
        this.snapshot.log(
            `[realm=${realmName}] [username=${user.username}] [group=${groupName}] User succssfully removed from group.`,
        );
    }
}
