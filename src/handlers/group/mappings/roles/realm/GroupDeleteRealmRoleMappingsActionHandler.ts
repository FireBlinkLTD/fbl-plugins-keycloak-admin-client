import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseGroupMappingsRealmRolesActionHandler } from './BaseGroupMappingsRealmRolesActionHandler';
import { GroupDeleteRealmRoleMappingsActionProcessor } from '../../../../../processors';

export class GroupDeleteRealmRoleMappingsActionHandler extends BaseGroupMappingsRealmRolesActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupDeleteRealmRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
