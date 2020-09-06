import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseActionProcessor } from '../../../base';

export class GroupDeleteRoleMappingsActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        groupName: Joi.string().min(1).required(),

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
    getValidationSchema(): Joi.Schema | null {
        return GroupDeleteRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { realmName, groupName, credentials, roles } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const group = await this.findGroup(adminClient, realmName, groupName);
        const mappings = await this.findGroupRoleMappings(adminClient, group, realmName);

        /* istanbul ignore else */
        if (roles.realm) {
            await this.deleteRealmRoleMappingsForGroup(adminClient, group, realmName, roles.realm, mappings);
        }

        /* istanbul ignore else */

        if (roles.client) {
            for (const clientId of Object.keys(roles.client)) {
                const clientRoles = roles.client[clientId];
                const mappingClient = await this.findClient(adminClient, realmName, clientId);
                await this.deleteClientRoleMappingsForGroup(
                    adminClient,
                    group,
                    mappingClient,
                    realmName,
                    clientRoles,
                    mappings,
                );
            }
        }
    }
}
