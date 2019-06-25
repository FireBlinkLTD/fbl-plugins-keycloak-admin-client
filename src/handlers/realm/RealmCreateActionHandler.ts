import { BaseRealmActionHandler } from './BaseRealmActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmCreateActionProcessor } from '../../processors';

export class RealmCreateActionHandler extends BaseRealmActionHandler {
    get action(): string {
        return 'create';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmCreateActionProcessor(options, context, snapshot, parameters);
    }
}
