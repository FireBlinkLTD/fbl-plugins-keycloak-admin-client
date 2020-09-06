import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { ICompositeRoleMappingRepresentation } from '../../../interfaces';
import { BaseRoleActionProcessor } from '../BaseRoleActionProcessor';

export class RealmRoleCreateActionProcessor extends BaseRoleActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        role: Joi.object()
            .keys({
                name: Joi.string().required().min(1),
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
    getValidationSchema(): Joi.Schema | null {
        return RealmRoleCreateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, role, realmName } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);

        let compositeRoles: ICompositeRoleMappingRepresentation;
        if (role.composites) {
            compositeRoles = await this.findCompositeRoles(adminClient, realmName, role.composites);
        }

        this.snapshot.log(`[realm=${realmName}] Creating role ${role.name}.`);
        await adminClient.roles.create(realmName, role);
        this.snapshot.log(`[realm=${realmName}] Role ${role.name} successfully created.`);

        if (compositeRoles) {
            this.snapshot.log(`[realm=${realmName}] Loading role ${role.name}.`);
            const parentRole = await adminClient.roles.findOne(realmName, role.name);
            this.snapshot.log(`[realm=${realmName}] Role ${role.name} successfully loaded.`);

            const roles = [...compositeRoles.realm];
            for (const clientId of Object.keys(compositeRoles.client)) {
                roles.push(...compositeRoles.client[clientId]);
            }

            await this.addCompositeRoles(adminClient, realmName, parentRole, roles);
        }
    }
}
