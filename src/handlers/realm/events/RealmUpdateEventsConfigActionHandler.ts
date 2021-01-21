import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmUpdateEventsConfigProcessor } from '../../../processors';
import { BaseRealmEventsActionHandler } from './BaseRealmEventsActionHandler';

export class RealmUpdateEventsConfigActionHandler extends BaseRealmEventsActionHandler {
    get action(): string {
        return 'update';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmUpdateEventsConfigProcessor(options, context, snapshot, parameters);
    }
}
