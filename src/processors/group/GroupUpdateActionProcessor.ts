import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseActionProcessor } from '../base';

export class GroupUpdateActionProcessor extends BaseActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string().min(1).required(),
        groupName: Joi.string().min(1).required(),
        group: Joi.object({
            name: Joi.string().min(1).required(),
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
        return GroupUpdateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const { credentials, realmName, groupName, group } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const kcGroup = await this.findGroup(adminClient, realmName, groupName);

        this.snapshot.log(`[realm=${realmName}] [group=${groupName}] Updating group.`);
        await adminClient.groups.update(realmName, kcGroup.id, group);
        this.snapshot.log(`[realm=${realmName}] [group=${groupName}] Group successfully updated.`);
    }
}
