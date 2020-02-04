import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseServiceAccountActionProcessor } from './BaseServiceAccountActionProcessor';

export class ClientDeleteServiceAccountUserActionProcessor extends BaseServiceAccountActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        clientId: Joi.string()
            .min(1)
            .required(),

        roles: Joi.object({
            realm: Joi.array().items(Joi.string().min(1)),
            client: Joi.object().pattern(/.*/, Joi.array().items(Joi.string().min(1))),
        }).required(),
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
        return ClientDeleteServiceAccountUserActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, clientId, roles } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const client = await this.findClient(adminClient, realmName, clientId);
        const serviceAccount = await this.getServiceAccountUser(adminClient, realmName, client);
        const roleMappings = await this.findUserRoleMappings(adminClient, serviceAccount, realmName);

        /* istanbul ignore else */
        if (roles.realm) {
            await this.deleteRealmRoleMappingsForUser(
                adminClient,
                serviceAccount,
                realmName,
                roles.realm,
                roleMappings,
            );
        }

        /* istanbul ignore else */

        if (roles.client) {
            for (const cid of Object.keys(roles.client)) {
                const clientRoles = roles.client[cid];
                const mappingClient = await this.findClient(adminClient, realmName, cid);
                await this.deleteClientRoleMappingsForUser(
                    adminClient,
                    serviceAccount,
                    mappingClient,
                    realmName,
                    clientRoles,
                    roleMappings,
                );
            }
        }
    }
}
