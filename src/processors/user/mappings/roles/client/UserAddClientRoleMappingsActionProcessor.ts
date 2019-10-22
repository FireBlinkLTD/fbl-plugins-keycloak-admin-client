import * as Joi from 'joi';

import { BaseUserClientRoleMappingsActionProcessor } from './BaseUserClientRoleMappingsActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../../schemas';

export class UserAddClientRoleMappingsActionProcessor extends BaseUserClientRoleMappingsActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        clientId: Joi.string()
            .required()
            .min(1),
        clientRoles: Joi.array()
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
        return UserAddClientRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const { realmName, username, email, clientRoles, clientId } = this.options;

        const user = await this.findUser(adminClient, realmName, username, email);
        const client = await this.findClient(adminClient, realmName, clientId);
        const mappings = await this.findRoleMappings(adminClient, user.id, realmName);

        await this.addRoleMappings(adminClient, user.id, client, realmName, clientRoles, mappings);
    }
}
