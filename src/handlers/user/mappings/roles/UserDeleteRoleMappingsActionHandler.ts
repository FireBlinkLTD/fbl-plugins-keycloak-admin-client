import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { UserDeleteRoleMappingsActionProcessor } from '../../../../processors';
import { BaseUserRoleMappingsActionHandler } from './BaseUserRoleMappingsActionHandler';

export class UserDeleteRoleMappingsActionHandler extends BaseUserRoleMappingsActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserDeleteRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
