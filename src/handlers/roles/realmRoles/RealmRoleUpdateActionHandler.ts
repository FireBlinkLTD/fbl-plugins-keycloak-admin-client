import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmRoleUpdateActionProcessor } from '../../../processors';
import { BaseRealmRoleActionHandler } from './BaseRealmRoleActionHandler';

export class RealmRoleUpdateActionHandler extends BaseRealmRoleActionHandler {
    get action(): string {
        return 'update';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmRoleUpdateActionProcessor(options, context, snapshot, parameters);
    }
}
