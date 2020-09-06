import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseActionProcessor } from '../../base';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';

export class ClientSecretGetActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        clientId: Joi.string().required().min(1),
        assignClientSecretTo: FBL_ASSIGN_TO_SCHEMA,
        pushClientSecretTo: FBL_PUSH_TO_SCHEMA,
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
        return ClientSecretGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { realmName, credentials, clientId, assignClientSecretTo, pushClientSecretTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);

        this.snapshot.log(`[realm=${realmName}] [clientId=${clientId}] Getting a client.`);
        const client = await this.findClient(adminClient, realmName, clientId);
        this.snapshot.log(`[realm=${realmName}] [clientId=${clientId}] Client information successfully received.`);

        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Getting client secret.`);
        const credentialRepresentation = await adminClient.clients.getSecret(realmName, client.id);
        this.snapshot.log(`[realm=${realmName}] [clientId=${client.clientId}] Client secret successfully received.`);

        ContextUtil.assignTo(
            this.context,
            this.parameters,
            this.snapshot,
            assignClientSecretTo,
            credentialRepresentation.value,
        );
        ContextUtil.pushTo(
            this.context,
            this.parameters,
            this.snapshot,
            pushClientSecretTo,
            credentialRepresentation.value,
        );
    }
}
