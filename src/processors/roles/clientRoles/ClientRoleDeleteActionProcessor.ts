import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseActionProcessor } from '../../base';

export class ClientRoleDeleteActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        clientId: Joi.string().min(1).required(),
        roleName: Joi.string().min(1).required(),
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
        return ClientRoleDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, clientId, roleName } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const client = await this.findClient(adminClient, realmName, clientId);

        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Removing role ${roleName}.`);
        await adminClient.clients.deleteRole(realmName, client.id, roleName);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Role ${roleName} successfully removed.`);
    }
}
