import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil, ActionError } from 'fbl';
import { BaseRoleActionProcessor } from '../BaseRoleActionProcessor';

export class RealmRoleGetActionProcessor extends BaseRoleActionProcessor {
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
        const { credentials, roleName, realmName } = this.options;
        const adminClient = await this.getKeycloakAdminClient(credentials);

        await this.wrapKeycloakAdminRequest(async () => {
            const role = await adminClient.roles.findOneByName({
                name: roleName,
                realm: realmName,
            });

            if (!role) {
                throw new ActionError(
                    `Unable to find role "${roleName}" of realm "${realmName}". Role not found`,
                    '404',
                );
            }

            if (role.composite) {
                role.composites = await this.getCompositeRoles(adminClient, realmName, role);
            }

            ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignRoleTo, role);
            ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushRoleTo, role);
        });
    }
}
