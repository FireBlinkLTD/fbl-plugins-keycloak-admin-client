import { BaseActionHandler } from '../../BaseActionHandler';

export abstract class BaseRealmRoleActionHandler extends BaseActionHandler {
    get group(): string {
        return 'realm.role';
    }
}
