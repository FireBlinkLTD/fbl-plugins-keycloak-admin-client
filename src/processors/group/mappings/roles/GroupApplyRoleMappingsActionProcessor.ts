import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseKeycloakAdminClientActionProcessor } from '../../../BaseKeycloakAdminClientActionProcessor';
import { ICompositeRoleRepresentation } from '../../../../interfaces';

export class GroupApplyRoleMappingsActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
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
        return GroupApplyRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async process(): Promise<void> {
        const { realmName, groupName, credentials, roles } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const group = await this.findGroup(adminClient, realmName, groupName);
        const mappings = await this.findGroupRoleMappings(adminClient, group, realmName);

        if (roles.realm) {
            await this.addRealmRoleMappingsForGroup(adminClient, group, realmName, roles.realm, mappings);

            const realmRolesToRemove = mappings.realm.filter(r => roles.realm.indexOf(r) < 0);
            await this.deleteRealmRoleMappingsForGroup(adminClient, group, realmName, realmRolesToRemove, mappings);
        } else {
            /* istanbul ignore else */
            if (mappings.realm.length) {
                await this.deleteRealmRoleMappingsForGroup(adminClient, group, realmName, mappings.realm, mappings);
            }
        }

        /* istanbul ignore else */

        if (roles.client) {
            for (const clientId of Object.keys(roles.client)) {
                const clientRoles = roles.client[clientId];
                const mappingClient = await this.findClient(adminClient, realmName, clientId);
                await this.addClientRoleMappingsForGroup(
                    adminClient,
                    group,
                    mappingClient,
                    realmName,
                    clientRoles,
                    mappings,
                );
            }
        }

        for (const clientId of Object.keys(mappings.client)) {
            const clientRoles = mappings.client[clientId];
            const mappingClient = await this.findClient(adminClient, realmName, clientId);

            if (roles.client && roles.client[clientId]) {
                const clientRolesToRemove = clientRoles.filter(r => roles.client[clientId].indexOf(r) < 0);
                await this.deleteClientRoleMappingsForGroup(
                    adminClient,
                    group,
                    mappingClient,
                    realmName,
                    clientRolesToRemove,
                    mappings,
                );
            } else {
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
