import { BaseActionHandler } from '../../../../BaseActionHandler';

export abstract class BaseUserMappingsClientRolesActionHandler extends BaseActionHandler {
    get group(): string {
        return 'user.mappings.client.roles';
    }
}
