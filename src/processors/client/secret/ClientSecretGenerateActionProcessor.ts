import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseActionProcessor } from '../../base';

export class ClientSecretGenerateActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
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
    getValidationSchema(): Joi.SchemaLike | null {
        return ClientSecretGenerateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { realmName, credentials, clientId } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);

        this.snapshot.log(`[realm=${realmName}] [clientId=${clientId}] Getting a client.`);
        const client = await this.findClient(adminClient, realmName, clientId);
        this.snapshot.log(`[realm=${realmName}] [clientId=${clientId}] Client information successfully received.`);

        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Generating new client secret.`);
        await adminClient.clients.generateNewSecret(realmName, client.id);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Client secret successfully generated.`);
    }
}
