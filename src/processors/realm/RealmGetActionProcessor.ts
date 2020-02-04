import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';
import { BaseActionProcessor } from '../base';

export class RealmGetActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .required()
            .min(1),
        assignRealmTo: FBL_ASSIGN_TO_SCHEMA,
        pushRealmTo: FBL_PUSH_TO_SCHEMA,
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
        return RealmGetActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, assignRealmTo, pushRealmTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Looking for realm.`);
        const realm = await adminClient.realms.findOne(realmName);
        this.snapshot.log(`[realm=${realmName}] Realm successully loaded.`);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignRealmTo, realm);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushRealmTo, realm);
    }
}
