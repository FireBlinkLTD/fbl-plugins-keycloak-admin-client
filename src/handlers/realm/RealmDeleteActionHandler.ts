import { BaseRealmActionHandler } from './BaseRealmActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmDeleteActionProcessor } from '../../processors';

export class RealmDeleteActionHandler extends BaseRealmActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmDeleteActionProcessor(options, context, snapshot, parameters);
    }
}
