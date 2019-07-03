import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';

export class ClientRoleCreateActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        clientId: Joi.string()
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
        return ClientRoleCreateActionProcessor.validationSchema;
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
                `Unable to create role "${this.options.role.name}" for client with clientId: ${this.options.clientId} of realm "${this.options.realmName}". Client not found`,
            );
        }

        this.options.role.id = clients[0].id;
        this.options.role.realm = this.options.realmName;

        await this.wrapKeycloakAdminRequest(async () => {
            await adminClient.clients.createRole(this.options.role);
        });
    }
}
