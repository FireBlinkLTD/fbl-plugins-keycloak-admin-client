import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';

export class ClientCreateActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
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
        return ClientCreateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);
        this.options.client.realm = this.options.realmName;

        await this.wrapKeycloakAdminRequest(async () => {
            await adminClient.clients.create(this.options.client);
        });
    }
}
