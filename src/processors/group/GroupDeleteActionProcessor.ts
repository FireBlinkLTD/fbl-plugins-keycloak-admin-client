import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { ActionError } from 'fbl';
import GroupRepresentation from 'keycloak-admin/lib/defs/groupRepresentation';
import { BaseGroupActionProcessor } from './BaseGroupActionProcessor';

export class GroupDeleteActionProcessor extends BaseGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        groupName: Joi.string()
            .min(1)
            .required(),
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
        return GroupDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const exactGroup = await this.findGroup(adminClient, this.options.realmName, this.options.groupName);

        await this.wrapKeycloakAdminRequest(async () => {
            await adminClient.groups.del({
                realm: this.options.realmName,
                id: exactGroup.id,
            });
        });
    }
}
