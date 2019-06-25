import { BaseActionHandler } from '../BaseActionHandler';

export abstract class BaseRealmActionHandler extends BaseActionHandler {
    get group(): string {
        return 'realm';
    }
}
