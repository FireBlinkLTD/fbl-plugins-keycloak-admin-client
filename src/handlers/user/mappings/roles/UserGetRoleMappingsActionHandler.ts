import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { UserGetRoleMappingsActionProcessor } from '../../../../processors';
import { BaseUserRoleMappingsActionHandler } from './BaseUserRoleMappingsActionHandler';

export class UserGetRoleMappingsActionHandler extends BaseUserRoleMappingsActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserGetRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
