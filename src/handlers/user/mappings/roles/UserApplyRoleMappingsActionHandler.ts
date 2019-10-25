import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { UserApplyRoleMappingsActionProcessor } from '../../../../processors';
import { BaseUserRoleMappingsActionHandler } from './BaseUserRoleMappingsActionHandler';

export class UserApplyRoleMappingsActionHandler extends BaseUserRoleMappingsActionHandler {
    get action(): string {
        return 'apply';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserApplyRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
