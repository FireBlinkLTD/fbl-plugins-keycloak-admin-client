import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { ActionError } from 'fbl';
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
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);
        const user = await this.findUser(
            adminClient,
            this.options.realmName,
            this.options.username,
            this.options.email,
        );

        await this.wrapKeycloakAdminRequest(async () => {
            await adminClient.users.del({
                id: user.id,
                realm: this.options.realmName,
            });
        });
    }
}
