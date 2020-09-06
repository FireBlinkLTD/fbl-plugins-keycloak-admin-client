import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseActionProcessor } from '../base';

export class GroupGetActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        groupName: Joi.string().min(1).required(),
        assignGroupTo: FBL_ASSIGN_TO_SCHEMA,
        pushGroupTo: FBL_PUSH_TO_SCHEMA,
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
        return GroupGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, groupName, assignGroupTo, pushGroupTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const group = await this.findGroup(adminClient, realmName, groupName);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignGroupTo, group);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushGroupTo, group);
    }
}
