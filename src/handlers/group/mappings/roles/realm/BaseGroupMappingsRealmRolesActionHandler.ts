import { BaseActionHandler } from '../../../../BaseActionHandler';

export abstract class BaseGroupMappingsRealmRolesActionHandler extends BaseActionHandler {
    get group(): string {
        return 'group.mappings.realm.roles';
    }
}
