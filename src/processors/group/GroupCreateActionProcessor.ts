import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseKeycloakAdminClientActionProcessor } from '../BaseKeycloakAdminClientActionProcessor';

export class GroupCreateActionProcessor extends BaseKeycloakAdminClientActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        group: Joi.object({
            name: Joi.string()
                .min(1)
                .required(),
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
    getValidationSchema(): Joi.SchemaLike | null {
        return GroupCreateActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async process(): Promise<void> {
        const { credentials, realmName, group } = this.options;

        const adminClient = await this.getKeycloakAdminClient(credentials);
        const createdGroup = await adminClient.groups.create({
            ...group,
            realm: realmName,
        });

        this.snapshot.log(`Group "${group.name}" for realm "${realmName}" created. Group ID: ${createdGroup.id}`);
    }
}
