import * as Joi from 'joi';

import { BaseUserRealmRoleMappingsActionProcessor } from './BaseUserRealmRoleMappingsActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../../schemas';

export class UserDeleteRealmRoleMappingsActionProcessor extends BaseUserRealmRoleMappingsActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        realmRoles: Joi.array()
            .items(Joi.string().min(1))
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
        return UserDeleteRealmRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const { realmName, username, email, realmRoles } = this.options;

        const user = await this.findUser(adminClient, realmName, username, email);
        const mappings = await this.findRoleMappings(adminClient, user.id, realmName);

        await this.deleteRoleMappings(adminClient, user.id, realmName, realmRoles, mappings);
    }
}
