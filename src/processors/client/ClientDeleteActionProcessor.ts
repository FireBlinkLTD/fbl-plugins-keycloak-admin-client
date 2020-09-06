import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseActionProcessor } from '../base';

export class ClientDeleteActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().required().min(1),
        clientId: Joi.string().required().min(1),
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
        return ClientDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, clientId } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const client = await this.findClient(adminClient, realmName, clientId);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Removing client.`);
        await adminClient.clients.delete(realmName, client.id);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Client successfully removed.`);
    }
}
