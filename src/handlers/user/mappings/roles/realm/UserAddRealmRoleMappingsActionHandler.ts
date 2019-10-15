import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseUserMappingsRealmRolesActionHandler } from './BaseUserMappingsRealmRolesActionHandler';
import { UserAddRealmRoleMappingsActionProcessor } from '../../../../../processors';

export class UserAddRealmRoleMappingsActionHandler extends BaseUserMappingsRealmRolesActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserAddRealmRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
