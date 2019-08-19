import { BaseActionHandler } from '../../../BaseActionHandler';

export abstract class BaseUserGroupActionHandler extends BaseActionHandler {
    get group(): string {
        return 'user.groups';
    }
}
