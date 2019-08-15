import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil, ActionError } from 'fbl';
import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';

export class UserGetActionProcessor extends BaseKeycloakAdminClientActionProcessor {
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

        await this.wrapKeycloakAdminRequest(async () => {
            const users = await adminClient.users.find({
                realm: this.options.realmName,
                username: this.options.username,
                email: this.options.email,
                max: 1,
            });

            if (!users.length) {
                throw new ActionError(
                    `Unable to find user "${this.options.username || this.options.email}" in realm "${
                        this.options.realmName
                    }"`,
                    '404',
                );
            }

            ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignUserTo, users[0]);
            ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushUserTo, users[0]);
        });
    }
}
