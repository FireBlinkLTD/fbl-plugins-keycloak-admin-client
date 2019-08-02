import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseGroupMappingsActionProcessor } from './BaseGroupMappingsActionProcessor';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export class GroupGetRoleMappingsActionProcessor extends BaseGroupMappingsActionProcessor {
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
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);
        const { realmName, groupName } = this.options;

        const group = await this.findGroup(adminClient, realmName, groupName);

        const mappings = await this.findRoleMappings(adminClient, group.id, realmName);

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
