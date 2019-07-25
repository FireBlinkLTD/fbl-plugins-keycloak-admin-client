import { BaseActionHandler } from '../BaseActionHandler';

export abstract class BaseGroupActionHandler extends BaseActionHandler {
    get group(): string {
        return 'group';
    }
}
