import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { RealmRoleGetActionProcessor } from '../../../processors';
import { BaseRealmRoleActionHandler } from './BaseRealmRoleActionHandler';

export class RealmRoleGetActionHandler extends BaseRealmRoleActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new RealmRoleGetActionProcessor(options, context, snapshot, parameters);
    }
}
