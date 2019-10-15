import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseUserMappingsActionProcessor } from './BaseUserMappingsActionProcessor';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export class UserGetRoleMappingsActionProcessor extends BaseUserMappingsActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        assignRoleMappingsTo: FBL_ASSIGN_TO_SCHEMA,
        pushRoleMappingsTo: FBL_PUSH_TO_SCHEMA,
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
        return UserGetRoleMappingsActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);
        const { realmName, username, email } = this.options;

        const user = await this.findUser(adminClient, realmName, username, email);

        const mappings = await this.findRoleMappings(adminClient, user.id, realmName);

        const result: {
            realmRoles: string[];
            clientRoles: { [clientId: string]: string[] };
        } = {
            realmRoles: [],
            clientRoles: {},
        };

        if (mappings.realmMappings) {
            result.realmRoles = mappings.realmMappings.map(r => r.name);
        }

        /* istanbul ignore else */
        if (mappings.clientMappings) {
            for (const clientId of Object.keys(mappings.clientMappings)) {
                result.clientRoles[clientId] = mappings.clientMappings[clientId].mappings.map(
                    (r: RoleRepresentation) => r.name,
                );
            }
        }

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignRoleMappingsTo, result);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushRoleMappingsTo, result);
    }
}
