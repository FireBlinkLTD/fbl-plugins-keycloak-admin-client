import * as Joi from 'joi';

import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';
import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { FBL_ASSIGN_TO_SCHEMA, FBL_PUSH_TO_SCHEMA, ContextUtil } from 'fbl';

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
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);
        const realm = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.realms.findOne({ realm: this.options.realmName });
        });

        if (!realm) {
            throw new Error(`Unable to find realm with name: ${this.options.realmName}`);
        }

        ContextUtil.assignTo(this.context, this.parameters, this.snapshot, this.options.assignRealmTo, realm);
        ContextUtil.pushTo(this.context, this.parameters, this.snapshot, this.options.pushRealmTo, realm);
    }
}
