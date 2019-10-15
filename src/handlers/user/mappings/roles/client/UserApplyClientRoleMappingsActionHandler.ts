import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseUserMappingsClientRolesActionHandler } from './BaseUserMappingsClientRolesActionHandler';
import { UserApplyClientRoleMappingsActionProcessor } from '../../../../../processors';

export class UserApplyClientRoleMappingsActionHandler extends BaseUserMappingsClientRolesActionHandler {
    get action(): string {
        return 'apply';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserApplyClientRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
