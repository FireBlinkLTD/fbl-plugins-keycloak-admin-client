import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { ContextUtil } from 'fbl';
import { BaseActionProcessor } from '../../base';

export class RealmUpdateEventsConfigProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().required().min(1),
        config: Joi.object()
            .keys({
                adminEventsDetailsEnabled: Joi.boolean(),
                adminEventsEnabled: Joi.boolean(),
                enabledEventTypes: Joi.array().items(Joi.string().min(1)),
                eventsEnabled: Joi.boolean(),
                eventsExpiration: Joi.number(),
                eventsListeners: Joi.array().items(Joi.string().min(1)),
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
        return RealmUpdateEventsConfigProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, config } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Updating realm events config.`);
        await adminClient.realms.updateEventsConfig(realmName, config);
        this.snapshot.log(`[realm=${realmName}] Realm events config successfully updated.`);
    }
}
