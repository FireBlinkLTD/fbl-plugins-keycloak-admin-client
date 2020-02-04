import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseActionProcessor } from '../base';

export class UserCreateActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
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
        .required()
        .options({
            abortEarly: true,
            allowUnknown: false,
        });

    /**
     * @inheritdoc
     */
    getValidationSchema(): Joi.SchemaLike | null {
        return UserCreateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, user } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] [username=${user.username}] Creating new user.`);
        await adminClient.users.create(realmName, user);
        this.snapshot.log(`[realm=${realmName}] [username=${user.username}] User successfully created.`);
    }
}
