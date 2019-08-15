import { BaseActionHandler } from '../BaseActionHandler';

export abstract class BaseUserActionHandler extends BaseActionHandler {
    get group(): string {
        return 'user';
    }
}
