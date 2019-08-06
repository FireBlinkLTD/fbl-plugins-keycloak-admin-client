import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseGroupMappingsRealmRolesActionHandler } from './BaseGroupMappingsRealmRolesActionHandler';
import { GroupApplyRealmRoleMappingsActionProcessor } from '../../../../../processors';

export class GroupApplyRealmRoleMappingsActionHandler extends BaseGroupMappingsRealmRolesActionHandler {
    get action(): string {
        return 'apply';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupApplyRealmRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
