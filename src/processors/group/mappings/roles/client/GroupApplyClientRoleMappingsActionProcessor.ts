import * as Joi from 'joi';

import { BaseGroupClientRoleMappingsActionProcessor } from './BaseGroupClientRoleMappingsActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../../schemas';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export class GroupApplyClientRoleMappingsActionProcessor extends BaseGroupClientRoleMappingsActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
        clientId: Joi.string()
            .min(1)
            .required(),
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
        return GroupApplyClientRoleMappingsActionProcessor.validationSchema;
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

        let rolesToAdd: string[] = clientRoles;
        let rolesToRemove: string[] = [];

        /* istanbul ignore else */
        if (mappings.clientMappings && mappings.clientMappings[clientId]) {
            rolesToAdd = clientRoles.filter((r: string) => {
                return !mappings.clientMappings[clientId].mappings.find((role: RoleRepresentation) => role.name === r);
            });

            rolesToRemove = mappings.clientMappings[clientId].mappings
                .filter((r: RoleRepresentation) => {
                    return clientRoles.indexOf(r.name) < 0;
                })
                .map((r: RoleRepresentation) => r.name);
        }

        await this.deleteRoleMappings(adminClient, group.id, client, realmName, rolesToRemove, mappings);

        await this.addRoleMappings(adminClient, group.id, client, realmName, rolesToAdd, mappings);
    }
}
