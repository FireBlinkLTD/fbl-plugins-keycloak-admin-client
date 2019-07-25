import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil, ActionError } from 'fbl';
import { BaseGroupActionProcessor } from './BaseGroupActionProcessor';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export class GroupGetActionProcessor extends BaseGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
        assignGroupTo: FBL_ASSIGN_TO_SCHEMA,
        pushGroupTo: FBL_PUSH_TO_SCHEMA,
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
        return GroupGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const exactGroup = await this.findGroup(adminClient, this.options.realmName, this.options.groupName);

        await this.wrapKeycloakAdminRequest(async () => {
            const roleMappings = await adminClient.groups.listRoleMappings({
                id: exactGroup.id,
                realm: this.options.realmName,
            });

            if (roleMappings.realmMappings) {
                exactGroup.realmRoles = roleMappings.realmMappings.map(r => r.name);
            }

            if (roleMappings.clientMappings) {
                exactGroup.clientRoles = {};
                for (const clientId of Object.keys(roleMappings.clientMappings)) {
                    exactGroup.clientRoles[clientId] = roleMappings.clientMappings[clientId].map(
                        (r: RoleRepresentation) => r.name,
                    );
                }
            }
        });

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignGroupTo, exactGroup);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushGroupTo, exactGroup);
    }
}
