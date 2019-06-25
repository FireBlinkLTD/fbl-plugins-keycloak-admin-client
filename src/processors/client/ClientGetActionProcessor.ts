import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../scremas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';

export class ClientGetActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .required()
            .min(1),
        clientId: Joi.string()
            .required()
            .min(1),
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
    getValidationSchema(): Joi.SchemaLike | null {
        return ClientGetActionProcessor.validationSchema;
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
            throw new Error(`Unable to find client with clientId: ${this.options.clientId}.`);
        }

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignClientTo, clients[0]);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushClientTo, clients[0]);
    }
}
