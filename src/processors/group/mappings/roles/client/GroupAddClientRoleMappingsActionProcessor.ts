import * as Joi from 'joi';

import { BaseGroupClientRoleMappingsActionProcessor } from './BaseGroupClientRoleMappingsActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../../schemas';

export class GroupAddClientRoleMappingsActionProcessor extends BaseGroupClientRoleMappingsActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
        clientId: Joi.string()
            .required()
            .min(1),
        clientRoles: Joi.array()
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
        return GroupAddClientRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const { realmName, groupName, clientRoles, clientId } = this.options;

        const group = await this.findGroup(adminClient, realmName, groupName);
        const client = await this.findClient(adminClient, clientId, realmName);
        const mappings = await this.findRoleMappings(adminClient, group.id, realmName);

        await this.addRoleMappings(adminClient, group.id, client, realmName, clientRoles, mappings);
    }
}
