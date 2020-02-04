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
        const { credentials, realmName, username, email, assignGroupsTo, pushGroupsTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const user = await this.findUser(adminClient, realmName, username, email);

        this.snapshot.log(`[realm=${realmName}] [username=${user.username}] Looking for groups user is added to.`);
        const groups = await adminClient.users.listGroups(realmName, user.id);
        this.snapshot.log(
            `[realm=${realmName}] [username=${user.username}] Groups that user is added to successfully loaded.`,
        );

        const groupNames = groups.map((g: any) => g.name);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignGroupsTo, groupNames);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushGroupsTo, groupNames);
    }
}
