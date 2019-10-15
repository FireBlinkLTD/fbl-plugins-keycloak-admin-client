import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseUserMappingsRealmRolesActionHandler } from './BaseUserMappingsRealmRolesActionHandler';
import { UserDeleteRealmRoleMappingsActionProcessor } from '../../../../../processors';

export class UserDeleteRealmRoleMappingsActionHandler extends BaseUserMappingsRealmRolesActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserDeleteRealmRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
