import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { UserAddRoleMappingsActionProcessor } from '../../../../processors';
import { BaseUserRoleMappingsActionHandler } from './BaseUserRoleMappingsActionHandler';

export class UserAddRoleMappingsActionHandler extends BaseUserRoleMappingsActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserAddRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
