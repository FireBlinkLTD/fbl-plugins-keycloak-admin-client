import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil, ActionError } from 'fbl';
import { BaseRoleActionProcessor } from '../BaseRoleActionProcessor';

export class ClientRoleGetActionProcessor extends BaseRoleActionProcessor {
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
        assignRoleTo: FBL_ASSIGN_TO_SCHEMA,
        pushRoleTo: FBL_PUSH_TO_SCHEMA,
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
        return ClientRoleGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async process(): Promise<void> {
        const { credentials, roleName, realmName, clientId, assignRoleTo, pushRoleTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const client = await this.findClient(adminClient, realmName, clientId);

        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Looking for a role ${roleName}.`);
        const role = await adminClient.clients.findRole(realmName, client.id, roleName);

        if (!role) {
            throw new ActionError(
                `Unable to find role "${roleName}" for client with clientId: ${clientId} of realm "${realmName}". Role not found`,
                '404',
            );
        }

        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Role ${roleName} successfully loaded.`);
        if (role.composite) {
            role.composites = await this.getCompositeRoles(adminClient, realmName, role);
        }

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignRoleTo, role);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushRoleTo, role);
    }
}
