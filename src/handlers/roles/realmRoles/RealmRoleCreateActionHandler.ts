import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmRoleCreateActionProcessor } from '../../../processors';
import { BaseRealmRoleActionHandler } from './BaseRealmRoleActionHandler';

export class RealmRoleCreateActionHandler extends BaseRealmRoleActionHandler {
    get action(): string {
        return 'create';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmRoleCreateActionProcessor(options, context, snapshot, parameters);
    }
}
