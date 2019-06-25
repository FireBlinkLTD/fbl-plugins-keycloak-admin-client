import { BaseRealmActionHandler } from './BaseRealmActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmGetActionProcessor } from '../../processors';

export class RealmGetActionHandler extends BaseRealmActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmGetActionProcessor(options, context, snapshot, parameters);
    }
}
