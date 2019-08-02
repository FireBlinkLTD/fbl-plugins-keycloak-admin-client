import * as Joi from 'joi';

import { BaseGroupRealmRoleMappingsActionProcessor } from './BaseGroupRealmRoleMappingsActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../../schemas';

export class GroupDeleteRealmRoleMappingsActionProcessor extends BaseGroupRealmRoleMappingsActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
        realmRoles: Joi.array()
            .items(Joi.string().min(1))
            .min(1)
            .required(),
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
        return GroupDeleteRealmRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const { realmName, groupName, realmRoles } = this.options;

        const group = await this.findGroup(adminClient, realmName, groupName);
        const mappings = await this.findRoleMappings(adminClient, group.id, realmName);

        await this.deleteRoleMappings(adminClient, group.id, realmName, realmRoles, mappings);
    }
}
