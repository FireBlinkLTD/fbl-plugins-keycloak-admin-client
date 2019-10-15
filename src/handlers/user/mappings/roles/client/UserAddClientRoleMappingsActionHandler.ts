import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseUserMappingsClientRolesActionHandler } from './BaseUserMappingsClientRolesActionHandler';
import { UserAddClientRoleMappingsActionProcessor } from '../../../../../processors';

export class UserAddClientRoleMappingsActionHandler extends BaseUserMappingsClientRolesActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserAddClientRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
