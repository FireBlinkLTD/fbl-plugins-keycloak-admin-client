import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { ActionError } from 'fbl';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import { BaseGroupActionProcessor } from './BaseGroupActionProcessor';
import KeycloakAdminClient from 'keycloak-admin';
import RoleRepresentation, { RoleMappingPayload } from 'keycloak-admin/lib/defs/roleRepresentation';
import MappingsRepresentation from 'keycloak-admin/lib/defs/mappingsRepresentation';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';

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

        const exactGroup = await this.findGroup(adminClient, this.options.realmName, this.options.groupName);

        // update realm roles
        await this.updateGroup(adminClient, exactGroup);

        const roleMappings: MappingsRepresentation = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.groups.listRoleMappings({
                id: exactGroup.id,
                realm: this.options.realmName,
            });
        });

        await this.updateRealmRoles(adminClient, exactGroup, roleMappings);
        await this.updateClientRoles(adminClient, exactGroup, roleMappings);
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

    private async updateRealmRoles(
        adminClient: KeycloakAdminClient,
        exactGroup: GroupRepresentation,
        roleMappings: MappingsRepresentation,
    ): Promise<void> {
        if (this.options.group.realmRoles) {
            let rolesToAdd: string[];
            let rolesToRemove: RoleRepresentation[];

            if (!roleMappings.realmMappings) {
                rolesToAdd = this.options.group.realmRoles;
            } else {
                rolesToAdd = this.options.group.realmRoles.filter((r: string) => {
                    return roleMappings.realmMappings.find(role => role.name === r);
                });

                rolesToRemove = roleMappings.realmMappings.filter((r: RoleRepresentation) => {
                    return this.options.group.realmRoles.indexOf(r.name) < 0;
                });
            }

            if (rolesToAdd.length) {
                const roleMappingsToAdd = <RoleMappingPayload[]>await this.getRealmRoles(adminClient, rolesToAdd);

                this.snapshot.log('Adding realm role mapping for: ' + rolesToAdd.join(', '));
                await this.wrapKeycloakAdminRequest(async () => {
                    await adminClient.groups.addRealmRoleMappings({
                        id: exactGroup.id,
                        realm: this.options.realmName,
                        roles: roleMappingsToAdd,
                    });
                });
            }

            if (rolesToRemove) {
                this.snapshot.log('Removing realm role mapping for: ' + rolesToAdd.join(', '));
                await this.wrapKeycloakAdminRequest(async () => {
                    await adminClient.groups.delRealmRoleMappings({
                        id: exactGroup.id,
                        realm: this.options.realmName,
                        roles: <RoleMappingPayload[]>rolesToRemove,
                    });
                });
            }
        }
    }

    private async getRealmRoles(adminClient: KeycloakAdminClient, roles: string[]): Promise<RoleRepresentation> {
        return await this.wrapKeycloakAdminRequest(async () => {
            const realmRoles: RoleRepresentation[] = [];

            // unfortunatelly .find method is broken in adminClient, need to get each role one by one
            for (const role of roles) {
                const r = await adminClient.roles.findOneByName({
                    name: role,
                    realm: this.options.realmName,
                });

                if (!r) {
                    throw new ActionError(
                        `Unable to update group "${this.options.groupName}" in realm "${this.options.realmName}". Realm role "${role}" not found.`,
                        '404',
                    );
                }
                realmRoles.push(r);
            }

            return realmRoles;
        });
    }

    private async updateClientRoles(
        adminClient: KeycloakAdminClient,
        exactGroup: GroupRepresentation,
        roleMappings: MappingsRepresentation,
    ): Promise<void> {
        if (this.options.group.clientRoles) {
            for (const clientId of Object.keys(this.options.group.clientRoles)) {
                const clientRoles = this.options.group.clientRoles[clientId];
                const client = await this.findClient(adminClient, clientId);

                let rolesToAdd: string[];
                let rolesToRemove: RoleRepresentation[];

                if (!roleMappings.clientMappings || !roleMappings.clientMappings[clientId]) {
                    rolesToAdd = clientRoles;
                } else {
                    rolesToAdd = clientRoles.filter((r: string) => {
                        return roleMappings.clientMappings[clientId].find(
                            (role: RoleRepresentation) => role.name === r,
                        );
                    });

                    rolesToRemove = roleMappings.clientMappings[clientId].filter((r: RoleRepresentation) => {
                        return clientRoles.indexOf(r.name) < 0;
                    });
                }

                if (rolesToAdd.length) {
                    const roleMappingsToAdd = <RoleMappingPayload[]>(
                        await this.getClientRoles(adminClient, client, rolesToAdd)
                    );

                    this.snapshot.log(`Adding client "${clientId}" role mapping for: ` + rolesToAdd.join(', '));
                    await this.wrapKeycloakAdminRequest(async () => {
                        await adminClient.groups.addClientRoleMappings({
                            id: exactGroup.id,
                            clientUniqueId: client.id,
                            realm: this.options.realmName,
                            roles: roleMappingsToAdd,
                        });
                    });
                }

                if (rolesToRemove) {
                    this.snapshot.log(`Removing client "${clientId}" role mapping for: ` + rolesToAdd.join(', '));
                    await this.wrapKeycloakAdminRequest(async () => {
                        await adminClient.groups.delClientRoleMappings({
                            id: exactGroup.id,
                            realm: this.options.realmName,
                            clientUniqueId: client.id,
                            roles: <RoleMappingPayload[]>rolesToRemove,
                        });
                    });
                }
            }
        }
    }

    private async findClient(adminClient: KeycloakAdminClient, clientId: string): Promise<ClientRepresentation> {
        const clients = await adminClient.clients.find({
            clientId,
            realm: this.options.realmName,
        });

        if (!clients.length) {
            throw new ActionError(
                `Unable to update group "${this.options.groupName}" of realm "${this.options.realmName}". Client "${clientId}" not found`,
                '404',
            );
        }

        return clients[0];
    }

    private async getClientRoles(
        adminClient: KeycloakAdminClient,
        client: ClientRepresentation,
        roles: string[],
    ): Promise<RoleRepresentation> {
        return await this.wrapKeycloakAdminRequest(async () => {
            const clientRoles = await adminClient.clients.listRoles({
                id: client.id,
                realm: this.options.realmName,
            });

            return clientRoles.filter(r => roles.indexOf(r.name) >= 0);
        });
    }
}
