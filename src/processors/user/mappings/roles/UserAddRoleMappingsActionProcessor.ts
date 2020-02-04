import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseUserActionProcessor } from '../../BaseUserActionProcessor';

export class UserAddRoleMappingsActionProcessor extends BaseUserActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),

        roles: Joi.object({
            realm: Joi.array().items(Joi.string().min(1)),
            client: Joi.object().pattern(/.*/, Joi.array().items(Joi.string().min(1))),
        }).required(),
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
        return UserAddRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, username, email, roles } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const user = await this.findUser(adminClient, realmName, username, email);
        const roleMappings = await this.findUserRoleMappings(adminClient, user, realmName);

        /* istanbul ignore else */
        if (roles.realm) {
            await this.addRealmRoleMappingsForUser(adminClient, user, realmName, roles.realm, roleMappings);
        }

        /* istanbul ignore else */

        if (roles.client) {
            for (const clientId of Object.keys(roles.client)) {
                const clientRoles = roles.client[clientId];
                const client = await this.findClient(adminClient, realmName, clientId);
                await this.addClientRoleMappingsForUser(
                    adminClient,
                    user,
                    client,
                    realmName,
                    clientRoles,
                    roleMappings,
                );
            }
        }
    }
}
