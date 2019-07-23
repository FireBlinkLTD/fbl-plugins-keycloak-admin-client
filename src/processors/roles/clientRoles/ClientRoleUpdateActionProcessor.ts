import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { ActionError } from 'fbl';

export class ClientRoleUpdateActionProcessor extends BaseKeycloakAdminClientActionProcessor {
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
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const clients = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.clients.find({
                clientId: this.options.clientId,
                realm: this.options.realmName,
            });
        });

        if (!clients.length) {
            throw new ActionError(
                `Unable to update role "${this.options.roleName}" for client with clientId: ${this.options.clientId} of realm "${this.options.realmName}". Client not found`,
                '404',
            );
        }

        await this.wrapKeycloakAdminRequest(async () => {
            await adminClient.clients.updateRole(
                {
                    id: clients[0].id,
                    roleName: this.options.roleName,
                    realm: this.options.realmName,
                },
                this.options.role,
            );
        });
    }
}
