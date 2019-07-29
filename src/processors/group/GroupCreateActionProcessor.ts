import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../schemas';
import { BaseGroupActionProcessor } from './BaseGroupActionProcessor';

export class GroupCreateActionProcessor extends BaseGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        group: Joi.object({
            name: Joi.string()
                .min(1)
                .required(),
            realmRoles: Joi.array().items(Joi.string().min(1)),
            clientRoles: Joi.object().pattern(/.+/, Joi.array().items(Joi.string().min(1))),
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
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const group = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.groups.create({
                ...this.options.group,
                realm: this.options.realmName,
            });
        });

        await this.updateRealmRoles(adminClient, group.id, this.options.realmName, this.options.group.realmRoles, {});
        await this.updateClientRoles(adminClient, group.id, this.options.realmName, this.options.group.clientRoles, {});

        this.snapshot.log(
            `Group "${this.options.group.name}" for realm "${this.options.realmName}" created. Group ID: ${group.id}`,
        );
    }
}
