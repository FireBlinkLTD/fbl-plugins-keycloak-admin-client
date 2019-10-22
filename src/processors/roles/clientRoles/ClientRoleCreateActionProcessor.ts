import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseRoleActionProcessor } from '../BaseRoleActionProcessor';
import { ICompositeRoleMappingRepresentation } from '../../../interfaces';
import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export class ClientRoleCreateActionProcessor extends BaseRoleActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        clientId: Joi.string()
            .min(1)
            .required(),
        role: Joi.object()
            .keys({
                name: Joi.string()
                    .required()
                    .min(1),
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
        return ClientRoleCreateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, clientId, role } = this.options;
        const adminClient = await this.getKeycloakAdminClient(credentials);

        const client = await this.findClient(adminClient, realmName, clientId);
        await this.wrapKeycloakAdminRequest(async () => {
            let compositeRoles: ICompositeRoleMappingRepresentation;
            if (role.composites) {
                compositeRoles = await this.findCompositeRoles(adminClient, realmName, role.composites);
            }

            await adminClient.clients.createRole({
                id: client.id,
                realm: realmName,
                ...role,
            });

            const parentRole = await adminClient.clients.findRole({
                id: client.id,
                roleName: role.name,
                realm: realmName,
            });

            if (compositeRoles) {
                const roles: RoleRepresentation[] = [...compositeRoles.realm];
                for (const cid of Object.keys(compositeRoles.client)) {
                    roles.push(...compositeRoles.client[cid]);
                }

                await this.addCompositeRoles(adminClient, realmName, parentRole, roles);
            }
        });
    }
}
