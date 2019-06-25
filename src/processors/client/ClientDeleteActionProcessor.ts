import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../scremas';

export class ClientDeleteActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .required()
            .min(1),
        clientId: Joi.string()
            .required()
            .min(1),
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
        return ClientDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const clients = await adminClient.clients.find({
            clientId: this.options.clientId,
            realm: this.options.realmName,
        });

        if (!clients.length) {
            throw new Error(`Unable to delete client with clientId: ${this.options.clientId}. Client not found`);
        }

        await adminClient.clients.del({
            id: clients[0].id,
            realm: this.options.realmName,
        });
    }
}
