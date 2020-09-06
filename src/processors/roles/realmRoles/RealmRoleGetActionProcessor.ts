import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseRoleActionProcessor } from '../BaseRoleActionProcessor';

export class RealmRoleGetActionProcessor extends BaseRoleActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        roleName: Joi.string().min(1).required(),
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
    getValidationSchema(): Joi.Schema | null {
        return RealmRoleGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, roleName, realmName, assignRoleTo, pushRoleTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Loading role ${roleName}.`);
        const role = await adminClient.roles.findOne(realmName, roleName);

        this.snapshot.log(`[realm=${realmName}] Role ${roleName} successfully loaded.`);
        if (role.composite) {
            role.composites = await this.getCompositeRoles(adminClient, realmName, role);
        }

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignRoleTo, role);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushRoleTo, role);
    }
}
