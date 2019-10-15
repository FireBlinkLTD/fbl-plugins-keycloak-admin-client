import { BaseActionHandler } from '../../../../BaseActionHandler';

export abstract class BaseUserMappingsRealmRolesActionHandler extends BaseActionHandler {
    get group(): string {
        return 'user.mappings.realm.roles';
    }
}
