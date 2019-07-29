import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import { BaseGroupActionProcessor } from './BaseGroupActionProcessor';
import KeycloakAdminClient from 'keycloak-admin';
import MappingsRepresentation from 'keycloak-admin/lib/defs/mappingsRepresentation';

export class GroupUpdateActionProcessor extends BaseGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
        group: Joi.object({
            name: Joi.string()
                .min(1)
                .required(),
            realmRoles: Joi.array().items(Joi.string().min(1)),
            clientRoles: Joi.object().pattern(/.+/, Joi.array().items(Joi.string().min(1))),
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
    getValidationSchema(): Joi.SchemaLike | null {
        return GroupUpdateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const group = await this.findGroup(adminClient, this.options.realmName, this.options.groupName);

        // update realm roles
        await this.updateGroup(adminClient, group);

        const roleMappings: MappingsRepresentation = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.groups.listRoleMappings({
                id: group.id,
                realm: this.options.realmName,
            });
        });

        await this.updateRealmRoles(
            adminClient,
            group.id,
            this.options.realmName,
            this.options.group.realmRoles,
            roleMappings,
        );
        await this.updateClientRoles(
            adminClient,
            group.id,
            this.options.realmName,
            this.options.group.clientRoles,
            roleMappings,
        );
    }

    private async updateGroup(adminClient: KeycloakAdminClient, exactGroup: GroupRepresentation): Promise<void> {
        this.snapshot.log('Updating group itself');
        await this.wrapKeycloakAdminRequest(async () => {
            // update group itself
            await adminClient.groups.update(
                {
                    id: exactGroup.id,
                    realm: this.options.realmName,
                },
                this.options.group,
            );
        });
    }
}
