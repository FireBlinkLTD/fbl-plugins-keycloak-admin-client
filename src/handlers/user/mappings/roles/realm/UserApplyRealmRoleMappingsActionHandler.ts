import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseUserMappingsRealmRolesActionHandler } from './BaseUserMappingsRealmRolesActionHandler';
import { UserApplyRealmRoleMappingsActionProcessor } from '../../../../../processors';

export class UserApplyRealmRoleMappingsActionHandler extends BaseUserMappingsRealmRolesActionHandler {
    get action(): string {
        return 'apply';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserApplyRealmRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
