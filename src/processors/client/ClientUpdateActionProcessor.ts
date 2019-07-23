import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { ActionError } from 'fbl';

export class ClientUpdateActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .required()
            .min(1),
        client: Joi.object()
            .keys({
                clientId: Joi.string()
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
        return ClientUpdateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const clients = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.clients.find({
                clientId: this.options.client.clientId,
                realm: this.options.realmName,
            });
        });

        if (!clients.length) {
            throw new ActionError(
                `Unable to update client with clientId: ${this.options.client.clientId} of realm "${this.options.realmName}". Client not found`,
                '404',
            );
        }

        await this.wrapKeycloakAdminRequest(async () => {
            await adminClient.clients.update(
                {
                    id: clients[0].id,
                    realm: this.options.realmName,
                },
                this.options.client,
            );
        });
    }
}
