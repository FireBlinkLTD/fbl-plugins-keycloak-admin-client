import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseUserGroupActionProcessor } from './BaseUserGroupActionProcessor';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';

export class UserGetGroupsActionProcessor extends BaseUserGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        assignGroupsTo: FBL_ASSIGN_TO_SCHEMA,
        pushGroupsTo: FBL_PUSH_TO_SCHEMA,
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
        return UserGetGroupsActionProcessor.validationSchema;
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

        await this.wrapKeycloakAdminRequest(async () => {
            const groups = await adminClient.users.listGroups({
                id: user.id,
                realm: this.options.realmName,
            });

            const groupNames = groups.map(g => g.name);

            ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignGroupsTo, groupNames);
            ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushGroupsTo, groupNames);
        });
    }
}
