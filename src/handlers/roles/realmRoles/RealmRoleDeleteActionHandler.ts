import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmRoleDeleteActionProcessor } from '../../../processors';
import { BaseRealmRoleActionHandler } from './BaseRealmRoleActionHandler';

export class RealmRoleDeleteActionHandler extends BaseRealmRoleActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmRoleDeleteActionProcessor(options, context, snapshot, parameters);
    }
}
