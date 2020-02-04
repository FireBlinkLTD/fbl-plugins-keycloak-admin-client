import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseUserActionProcessor } from './BaseUserActionProcessor';

export class UserDeleteActionProcessor extends BaseUserActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
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
        return UserDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, username, email } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const user = await this.findUser(adminClient, realmName, username, email);

        this.snapshot.log(`[realm=${realmName}] [username=${user.username}] Removing user.`);
        await adminClient.users.delete(realmName, user.id);
        this.snapshot.log(`[realm=${realmName}] [username=${user.username}] User successfully removed.`);
    }
}
