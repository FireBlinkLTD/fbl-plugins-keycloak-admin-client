import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil, ActionError } from 'fbl';

export class RealmRoleGetActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        roleName: Joi.string()
            .min(1)
            .required(),
        assignRoleTo: FBL_ASSIGN_TO_SCHEMA,
        pushRoleTo: FBL_PUSH_TO_SCHEMA,
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
        return RealmRoleGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        await this.wrapKeycloakAdminRequest(async () => {
            const role = await adminClient.roles.findOneByName({
                name: this.options.roleName,
                realm: this.options.realmName,
            });

            if (!role) {
                throw new ActionError(
                    `Unable to find role "${this.options.roleName}" of realm "${this.options.realmName}". Role not found`,
                    '404',
                );
            }

            ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignRoleTo, role);
            ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushRoleTo, role);
        });
    }
}
