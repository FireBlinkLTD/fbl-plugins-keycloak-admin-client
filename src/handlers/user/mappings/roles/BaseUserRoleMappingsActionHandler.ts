import { BaseActionHandler } from '../../../BaseActionHandler';

export abstract class BaseUserRoleMappingsActionHandler extends BaseActionHandler {
    get group(): string {
        return 'user.mappings.roles';
    }
}
