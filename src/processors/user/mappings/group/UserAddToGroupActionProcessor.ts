import * as Joi from 'joi';

import { KEYCLOAK_CREDENTIALS_SCHEMA } from '../../../../schemas';
import { BaseUserGroupActionProcessor } from './BaseUserGroupActionProcessor';

export class UserAddToGroupActionProcessor extends BaseUserGroupActionProcessor {
    private static validationSchema = Joi.object({
        credentials: KEYCLOAK_CREDENTIALS_SCHEMA,
        realmName: Joi.string()
            .min(1)
            .required(),
        username: Joi.string().min(1),
        email: Joi.string().min(1),
        groupName: Joi.string()
            .min(1)
            .required(),
    })
        .xor('username', 'email')
        .required()
        .options({
            abortEarly: true,
            allowUnknown: false,
        });

    /**
     * @inheritdoc
     */
    getValidationSchema(): Joi.SchemaLike | null {
        return UserAddToGroupActionProcessor.validationSchema;
    }

    /**
     * @inheritdoc
     */
    async execute(): Promise<void> {
        const adminClient = await this.getKeycloakAdminClient(this.options.credentials);

        const user = await this.findUser(
            adminClient,
            this.options.realmName,
            this.options.username,
            this.options.email,
        );
        const group = await this.findGroup(adminClient, this.options.realmName, this.options.groupName);

        await this.wrapKeycloakAdminRequest(async () => {
            await adminClient.users.addToGroup({
                id: user.id,
                groupId: group.id,
                realm: this.options.realmName,
            });
        });
    }
}
