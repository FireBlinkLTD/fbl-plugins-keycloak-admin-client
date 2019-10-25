import { BaseActionHandler } from '../../../BaseActionHandler';

export abstract class BaseServiceAccountRoleMappingsActionHandler extends BaseActionHandler {
    get group(): string {
        return 'client.service.account.mappings.roles';
    }
}
