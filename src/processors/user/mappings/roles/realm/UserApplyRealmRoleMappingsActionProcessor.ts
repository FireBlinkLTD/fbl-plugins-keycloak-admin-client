import * as Joi from 'joi';

import { BaseUserRealmRoleMappingsActionProcessor } from './BaseUserRealmRoleMappingsActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../../schemas';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export class UserApplyRealmRoleMappingsActionProcessor extends BaseUserRealmRoleMappingsActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        realmRoles: Joi.array()
            .items(Joi.string().min(1))
            .min(1)
            .required(),
    })
        .xor('username', 'email')
        .required()
        .options({
            abortEarly: true,
            allowUnknown: false,
        });

    /**
     * @inheritdoc
     */
    getValidationSchema(): Joi.SchemaLike | null {
        return UserApplyRealmRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const { realmName, username, email, realmRoles } = this.options;

        const user = await this.findUser(adminClient, realmName, username, email);
        const mappings = await this.findRoleMappings(adminClient, user.id, realmName);

        let rolesToAdd: string[] = realmRoles;
        let rolesToRemove: string[] = [];

        /* istanbul ignore else */
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

        await this.deleteRoleMappings(adminClient, user.id, realmName, rolesToRemove, mappings);

        await this.addRoleMappings(adminClient, user.id, realmName, rolesToAdd, mappings);
    }
}
