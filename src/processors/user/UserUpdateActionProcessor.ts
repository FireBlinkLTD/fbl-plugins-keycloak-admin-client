import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { ActionError } from 'fbl';

export class UserUpdateActionProcessor extends BaseKeycloakAdminClientActionProcessor {
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
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        await this.wrapKeycloakAdminRequest(async () => {
            const users = await adminClient.users.find({
                realm: this.options.realmName,
                username: this.options.username,
                email: this.options.email,
                max: 1,
            });

            if (!users.length) {
                throw new ActionError(
                    `Unable to find user "${this.options.username || this.options.email}" in realm "${
                        this.options.realmName
                    }"`,
                    '404',
                );
            }

            await adminClient.users.update(
                {
                    id: users[0].id,
                    realm: this.options.realmName,
                },
                this.options.user,
            );
        });
    }
}
