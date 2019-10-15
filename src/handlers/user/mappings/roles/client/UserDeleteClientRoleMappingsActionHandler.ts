import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseUserMappingsClientRolesActionHandler } from './BaseUserMappingsClientRolesActionHandler';
import { UserDeleteClientRoleMappingsActionProcessor } from '../../../../../processors';

export class UserDeleteClientRoleMappingsActionHandler extends BaseUserMappingsClientRolesActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserDeleteClientRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
