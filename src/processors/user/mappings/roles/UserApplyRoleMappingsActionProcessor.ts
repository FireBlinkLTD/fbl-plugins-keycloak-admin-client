import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseUserActionProcessor } from '../../BaseUserActionProcessor';

export class UserApplyRoleMappingsActionProcessor extends BaseUserActionProcessor {
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
        return UserApplyRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async process(): Promise<void> {
        const { credentials, realmName, username, email, roles } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const user = await this.findUser(adminClient, realmName, username, email);
        const roleMappings = await this.findUserRoleMappings(adminClient, user, realmName);

        if (roles.realm) {
            await this.addRealmRoleMappingsForUser(adminClient, user, realmName, roles.realm, roleMappings);

            const realmRolesToRemove = roleMappings.realm.filter(r => roles.realm.indexOf(r) < 0);
            await this.deleteRealmRoleMappingsForUser(adminClient, user, realmName, realmRolesToRemove, roleMappings);
        } else {
            /* istanbul ignore else */
            if (roleMappings.realm.length) {
                await this.deleteRealmRoleMappingsForUser(
                    adminClient,
                    user,
                    realmName,
                    roleMappings.realm,
                    roleMappings,
                );
            }
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

        for (const clientId of Object.keys(roleMappings.client)) {
            const clientRoles = roleMappings.client[clientId];
            const mappingClient = await this.findClient(adminClient, realmName, clientId);

            if (roles.client && roles.client[clientId]) {
                const clientRolesToRemove = clientRoles.filter(r => roles.client[clientId].indexOf(r) < 0);
                await this.deleteClientRoleMappingsForUser(
                    adminClient,
                    user,
                    mappingClient,
                    realmName,
                    clientRolesToRemove,
                    roleMappings,
                );
            } else {
                await this.deleteClientRoleMappingsForUser(
                    adminClient,
                    user,
                    mappingClient,
                    realmName,
                    clientRoles,
                    roleMappings,
                );
            }
        }
    }
}
