import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil, ActionError } from 'fbl';

export class RealmGetActionProcessor extends BaseKeycloakAdminClientActionProcessor {
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
    async process(): Promise<void> {
        const { credentials, realmName, assignRealmTo, pushRealmTo } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        this.snapshot.log(`[realm=${realmName}] Looking for realm.`);
        const realm = await adminClient.realms.findOne({ realm: realmName });

        if (!realm) {
            throw new ActionError(`Unable to find realm with name: ${realmName}`, '404');
        }
        this.snapshot.log(`[realm=${realmName}] Realm successully loaded.`);

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, assignRealmTo, realm);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, pushRealmTo, realm);
    }
}
