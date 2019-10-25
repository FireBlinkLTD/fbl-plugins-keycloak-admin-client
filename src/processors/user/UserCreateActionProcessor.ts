import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';

export class UserCreateActionProcessor extends BaseKeycloakAdminClientActionProcessor {
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
    async process(): Promise<void> {
        const { credentials, realmName, user } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        await adminClient.users.create({
            ...user,
            realm: realmName,
        });
    }
}
