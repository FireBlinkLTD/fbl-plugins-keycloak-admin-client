import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseUserActionProcessor } from '../../BaseUserActionProcessor';

export class UserGetRoleMappingsActionProcessor extends BaseUserActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        assignRoleMappingsTo: FBL_ASSIGN_TO_SCHEMA,
        pushRoleMappingsTo: FBL_PUSH_TO_SCHEMA,
    })
        .xor('username', 'email')
        .required()
        .options({
            abortEarly: true,
            allowUnknown: false,
        });

    /**
     * @inheritdoc
     */
    getValidationSchema(): Joi.SchemaLike | null {
        return UserGetRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, username, email, assignRoleMappingsTo, pushRoleMappingsTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const user = await this.findUser(adminClient, realmName, username, email);
        const mappings = await this.findUserRoleMappings(adminClient, user, realmName);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignRoleMappingsTo, mappings);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushRoleMappingsTo, mappings);
    }
}
