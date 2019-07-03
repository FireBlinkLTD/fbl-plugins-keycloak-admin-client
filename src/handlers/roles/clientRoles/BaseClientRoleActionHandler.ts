import { BaseActionHandler } from '../../BaseActionHandler';

export abstract class BaseClientRoleActionHandler extends BaseActionHandler {
    get group(): string {
        return 'client.role';
    }
}
