import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseGroupMappingsClientRolesActionHandler } from './BaseGroupMappingsClientRolesActionHandler';
import { GroupApplyClientRoleMappingsActionProcessor } from '../../../../../processors';

export class GroupApplyClientRoleMappingsActionHandler extends BaseGroupMappingsClientRolesActionHandler {
    get action(): string {
        return 'apply';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupApplyClientRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
