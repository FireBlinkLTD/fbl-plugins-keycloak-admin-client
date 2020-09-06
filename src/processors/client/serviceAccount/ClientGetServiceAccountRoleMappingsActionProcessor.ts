import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseServiceAccountActionProcessor } from './BaseServiceAccountActionProcessor';

export class ClientGetServiceAccountUserActionProcessor extends BaseServiceAccountActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        clientId: Joi.string().min(1).required(),

        assignRoleMappingsTo: FBL_ASSIGN_TO_SCHEMA,
        pushRoleMappingsTo: FBL_PUSH_TO_SCHEMA,
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
        return ClientGetServiceAccountUserActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, clientId, assignRoleMappingsTo, pushRoleMappingsTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const client = await this.findClient(adminClient, realmName, clientId);
        const serviceAccount = await this.getServiceAccountUser(adminClient, realmName, client);
        const roleMappings = await this.findUserRoleMappings(adminClient, serviceAccount, realmName);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignRoleMappingsTo, roleMappings);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushRoleMappingsTo, roleMappings);
    }
}
