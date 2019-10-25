import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseServiceAccountActionProcessor } from './BaseServiceAccountActionProcessor';
import { ICompositeRoleRepresentation } from '../../../interfaces';

export class ClientApplyServiceAccountUserActionProcessor extends BaseServiceAccountActionProcessor {
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
        return ClientApplyServiceAccountUserActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async process(): Promise<void> {
        const { credentials, realmName, clientId, roles } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const client = await this.findClient(adminClient, realmName, clientId);
        const serviceAccount = await this.getServiceAccountUser(adminClient, realmName, client);
        const roleMappings = await this.findUserRoleMappings(adminClient, serviceAccount, realmName);

        if (roles.realm) {
            await this.addRealmRoleMappingsForUser(adminClient, serviceAccount, realmName, roles.realm, roleMappings);

            const realmRolesToRemove = roleMappings.realm.filter(r => roles.realm.indexOf(r) < 0);
            await this.deleteRealmRoleMappingsForUser(
                adminClient,
                serviceAccount,
                realmName,
                realmRolesToRemove,
                roleMappings,
            );
        } else {
            /* istanbul ignore else */
            if (roleMappings.realm.length) {
                await this.deleteRealmRoleMappingsForUser(
                    adminClient,
                    serviceAccount,
                    realmName,
                    roleMappings.realm,
                    roleMappings,
                );
            }
        }

        /* istanbul ignore else */

        if (roles.client) {
            for (const cid of Object.keys(roles.client)) {
                const clientRoles = roles.client[cid];
                const mappingClient = await this.findClient(adminClient, realmName, cid);
                await this.addClientRoleMappingsForUser(
                    adminClient,
                    serviceAccount,
                    mappingClient,
                    realmName,
                    clientRoles,
                    roleMappings,
                );
            }
        }

        for (const cid of Object.keys(roleMappings.client)) {
            const clientRoles = roleMappings.client[cid];
            const mappingClient = await this.findClient(adminClient, realmName, cid);

            if (roles.client && roles.client[cid]) {
                const clientRolesToRemove = clientRoles.filter(r => roles.client[cid].indexOf(r) < 0);
                await this.deleteClientRoleMappingsForUser(
                    adminClient,
                    serviceAccount,
                    mappingClient,
                    realmName,
                    clientRolesToRemove,
                    roleMappings,
                );
            } else {
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
