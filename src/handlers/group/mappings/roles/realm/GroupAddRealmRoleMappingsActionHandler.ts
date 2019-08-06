import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseGroupMappingsRealmRolesActionHandler } from './BaseGroupMappingsRealmRolesActionHandler';
import { GroupAddRealmRoleMappingsActionProcessor } from '../../../../../processors';

export class GroupAddRealmRoleMappingsActionHandler extends BaseGroupMappingsRealmRolesActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupAddRealmRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
