import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseActionProcessor } from '../base';

export class RealmDeleteActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().required().min(1),
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
        return RealmDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Removing realm.`);
        await adminClient.realms.delete(realmName);
        this.snapshot.log(`[realm=${realmName}] Realm successfully removed.`);
    }
}
