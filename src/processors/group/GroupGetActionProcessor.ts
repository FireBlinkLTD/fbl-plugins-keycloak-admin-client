import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseGroupActionProcessor } from './BaseGroupActionProcessor';

export class GroupGetActionProcessor extends BaseGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
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
    getValidationSchema(): Joi.SchemaLike | null {
        return GroupGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const group = await this.findGroup(adminClient, this.options.realmName, this.options.groupName);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignGroupTo, group);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushGroupTo, group);
    }
}
