import { BaseUserActionHandler } from '../../BaseUserActionHandler';
import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { UserGetRoleMappingsActionProcessor } from '../../../../processors';

export class UserGetRoleMappingsActionHandler extends BaseUserActionHandler {
    get group(): string {
        return 'user.mappings.roles';
    }

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
