import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmGetEventsConfigProcessor } from '../../../processors';
import { BaseRealmEventsActionHandler } from './BaseRealmEventsActionHandler';

export class RealmGetEventsConfigActionHandler extends BaseRealmEventsActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmGetEventsConfigProcessor(options, context, snapshot, parameters);
    }
}
