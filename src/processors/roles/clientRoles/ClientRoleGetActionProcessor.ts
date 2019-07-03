import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';

export class ClientRoleGetActionProcessor extends BaseKeycloakAdminClientActionProcessor {
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
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const clients = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.clients.find({
                clientId: this.options.clientId,
                realm: this.options.realmName,
            });
        });

        if (!clients.length) {
            throw new Error(
                `Unable to find role "${this.options.roleName}" for client with clientId: ${this.options.clientId} of realm "${this.options.realmName}". Client not found`,
            );
        }

        await this.wrapKeycloakAdminRequest(async () => {
            const role = await adminClient.clients.findRole({
                id: clients[0].id,
                roleName: this.options.roleName,
                realm: this.options.realmName,
            });

            if (!role) {
                throw new Error(
                    `Unable to find role "${this.options.roleName}" for client with clientId: ${this.options.clientId} of realm "${this.options.realmName}". Role not found`,
                );
            }

            ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignRoleTo, role);
            ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushRoleTo, role);
        });
    }
}
