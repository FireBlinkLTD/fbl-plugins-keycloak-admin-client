import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseRoleActionProcessor } from '../BaseRoleActionProcessor';

export class RealmRoleUpdateActionProcessor extends BaseRoleActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        roleName: Joi.string().min(1).required(),
        role: Joi.object()
            .keys({
                name: Joi.string().required().min(1),
            })
            .required()
            .options({
                abortEarly: true,
                allowUnknown: true,
            }),
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
        return RealmRoleUpdateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { roleName, realmName, role, credentials } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Upading role ${roleName}.`);
        await adminClient.roles.update(realmName, roleName, role);
        this.snapshot.log(`[realm=${realmName}] Role ${roleName} successfully updated.`);

        this.snapshot.log(`[realm=${realmName}] Loading role ${roleName}.`);
        const parentRole = await adminClient.roles.findOne(realmName, role.name);
        this.snapshot.log(`[realm=${realmName}] Role ${roleName} successfully loaded.`);

        if (parentRole.composite) {
            parentRole.composites = await this.getCompositeRoles(adminClient, realmName, parentRole);
        }

        await this.applyCompositeRoles(adminClient, realmName, parentRole, role.composites);
    }
}
