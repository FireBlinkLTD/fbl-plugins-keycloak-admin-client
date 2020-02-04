import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';

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
    async process(): Promise<void> {
        const { realmName, credentials, client } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const kcClient = await this.findClient(adminClient, realmName, client.clientId);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Updating client.`);
        await adminClient.clients.update(realmName, kcClient.id, client);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Client successfully updated.`);
    }
}
