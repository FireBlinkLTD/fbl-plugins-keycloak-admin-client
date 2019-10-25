import { BaseGroupActionHandler } from '../../BaseGroupActionHandler';

export abstract class BaseGroupRoleMappingsActionHandler extends BaseGroupActionHandler {
    get group(): string {
        return 'group.mappings.roles';
    }
}
