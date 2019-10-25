import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseKeycloakAdminClientActionProcessor } from '../../../BaseKeycloakAdminClientActionProcessor';

export class GroupGetRoleMappingsActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
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
    getValidationSchema(): Joi.SchemaLike | null {
        return GroupGetRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async process(): Promise<void> {
        const { realmName, groupName, credentials, assignRoleMappingsTo, pushRoleMappingsTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const group = await this.findGroup(adminClient, realmName, groupName);
        const mappings = await this.findGroupRoleMappings(adminClient, group, realmName);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignRoleMappingsTo, mappings);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushRoleMappingsTo, mappings);
    }
}
