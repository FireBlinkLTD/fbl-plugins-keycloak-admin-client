import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseRoleActionProcessor } from '../BaseRoleActionProcessor';

export class ClientRoleUpdateActionProcessor extends BaseRoleActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        clientId: Joi.string()
            .min(1)
            .required(),
        roleName: Joi.string()
            .min(1)
            .required(),
        role: Joi.object()
            .keys({
                name: Joi.string()
                    .required()
                    .min(1),
            })
            .required()
            .options({
                abortEarly: true,
                allowUnknown: true,
            }),
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
        return ClientRoleUpdateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async process(): Promise<void> {
        const { clientId, roleName, realmName, role, credentials } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const client = await this.findClient(adminClient, realmName, clientId);

        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Updating role ${roleName}.`);
        await adminClient.clients.updateRole(realmName, client.id, roleName, role);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Role ${roleName} successfully updated.`);

        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Loading role ${roleName}.`);
        const parentRole = await adminClient.clients.findRole(realmName, client.id, roleName);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Role ${roleName} successfully loaded.`);

        if (parentRole.composite) {
            parentRole.composites = await this.getCompositeRoles(adminClient, realmName, parentRole);
        }

        await this.applyCompositeRoles(adminClient, realmName, parentRole, role.composites);
    }
}
