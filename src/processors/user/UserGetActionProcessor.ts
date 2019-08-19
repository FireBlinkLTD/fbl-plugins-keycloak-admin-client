import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil, ActionError } from 'fbl';
import { BaseUserActionProcessor } from './BaseUserActionProcessor';

export class UserGetActionProcessor extends BaseUserActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        assignUserTo: FBL_ASSIGN_TO_SCHEMA,
        pushUserTo: FBL_PUSH_TO_SCHEMA,
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
        return UserGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);
        const user = await this.findUser(
            adminClient,
            this.options.realmName,
            this.options.username,
            this.options.email,
        );

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignUserTo, user);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushUserTo, user);
    }
}
