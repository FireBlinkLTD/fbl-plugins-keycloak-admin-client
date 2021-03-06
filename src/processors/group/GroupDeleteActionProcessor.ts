import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseActionProcessor } from '../base';

export class GroupDeleteActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        groupName: Joi.string().min(1).required(),
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
        return GroupDeleteActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, groupName } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const exactGroup = await this.findGroup(adminClient, realmName, groupName);

        this.snapshot.log(`[realm=${realmName}] [group=${groupName}] Removing group.`);
        await adminClient.groups.delete(realmName, exactGroup.id);
        this.snapshot.log(`[realm=${realmName}] [group=${groupName}] Group successfully removed.`);
    }
}
