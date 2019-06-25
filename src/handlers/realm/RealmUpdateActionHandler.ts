import { BaseRealmActionHandler } from './BaseRealmActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmUpdateActionProcessor } from '../../processors';

export class RealmUpdateActionHandler extends BaseRealmActionHandler {
    get action(): string {
        return 'update';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmUpdateActionProcessor(options, context, snapshot, parameters);
    }
}
