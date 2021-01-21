import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseActionProcessor } from '../../base';

export class RealmGetEventsConfigProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().required().min(1),
        assignEventsConfigTo: FBL_ASSIGN_TO_SCHEMA,
        pushEventsConfigTo: FBL_PUSH_TO_SCHEMA,
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
        return RealmGetEventsConfigProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, assignEventsConfigTo, pushEventsConfigTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Looking for a realm config.`);
        const config = await adminClient.realms.getEventsConfig(realmName);
        this.snapshot.log(`[realm=${realmName}] Realm config successfully loaded.`);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignEventsConfigTo, config);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushEventsConfigTo, config);
    }
}
