import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseUserActionProcessor } from './BaseUserActionProcessor';

export class UserUpdateActionProcessor extends BaseUserActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        user: Joi.object()
            .keys({
                email: Joi.string()
                    .min(1)
                    .required(),

                username: Joi.string()
                    .min(1)
                    .required(),

                enabled: Joi.boolean(),
            })
            .options({
                allowUnknown: true,
                abortEarly: true,
            })
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
        return UserUpdateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, username, email, user } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const kcUser = await this.findUser(adminClient, realmName, username, email);

        this.snapshot.log(`[realm=${realmName}] [username=${kcUser.username}] Updating user.`);
        await adminClient.users.update(realmName, kcUser.id, user);
        this.snapshot.log(`[realm=${realmName}] [username=${kcUser.username}] User successfully updated.`);
    }
}
