import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseActionProcessor } from '../base';

export class ClientGetActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().required().min(1),
        clientId: Joi.string().required().min(1),
        assignClientTo: FBL_ASSIGN_TO_SCHEMA,
        pushClientTo: FBL_PUSH_TO_SCHEMA,
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
        return ClientGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, clientId, assignClientTo, pushClientTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);

        this.snapshot.log(`[realm=${realmName}] [clientId=${clientId}] Getting a client.`);
        const client = await this.findClient(adminClient, realmName, clientId);
        this.snapshot.log(`[realm=${realmName}] [clientId=${clientId}] Client information successfully received.`);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignClientTo, client);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushClientTo, client);
    }
}
