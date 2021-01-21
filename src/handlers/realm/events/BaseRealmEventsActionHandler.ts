import { BaseRealmActionHandler } from '../BaseRealmActionHandler';

export abstract class BaseRealmEventsActionHandler extends BaseRealmActionHandler {
    get group(): string {
        return 'realm.events.config';
    }
}
