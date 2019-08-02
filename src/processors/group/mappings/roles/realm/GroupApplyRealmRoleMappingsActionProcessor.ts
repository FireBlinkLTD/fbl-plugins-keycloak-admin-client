import * as Joi from 'joi';

import { BaseGroupRealmRoleMappingsActionProcessor } from './BaseGroupRealmRoleMappingsActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../../schemas';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export class GroupApplyRealmRoleMappingsActionProcessor extends BaseGroupRealmRoleMappingsActionProcessor {
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
        return GroupApplyRealmRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const { realmName, groupName, realmRoles } = this.options;

        const group = await this.findGroup(adminClient, realmName, groupName);
        const mappings = await this.findRoleMappings(adminClient, group.id, realmName);

        let rolesToAdd: string[] = realmRoles;
        let rolesToRemove: string[] = [];

        if (mappings.realmMappings) {
            rolesToAdd = realmRoles.filter((r: string) => {
                return !mappings.realmMappings.find(role => role.name === r);
            });

            rolesToRemove = mappings.realmMappings
                .filter((r: RoleRepresentation) => {
                    return realmRoles.indexOf(r.name) < 0;
                })
                .map(r => r.name);
        }

        await this.deleteRoleMappings(adminClient, group.id, realmName, rolesToRemove, mappings);

        await this.addRoleMappings(adminClient, group.id, realmName, rolesToAdd, mappings);
    }
}
