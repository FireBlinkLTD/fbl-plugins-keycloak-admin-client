import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { BaseActionProcessor } from '../../base';

export class RealmRoleDeleteActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        roleName: Joi.string().min(1).required(),
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
        return RealmRoleDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, roleName, realmName } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Removing role ${roleName}.`);
        await adminClient.roles.delete(realmName, roleName);
        this.snapshot.log(`[realm=${realmName}] Role ${roleName} successfully removed.`);
    }
}
