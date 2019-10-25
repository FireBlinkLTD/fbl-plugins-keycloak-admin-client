import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { GroupDeleteRoleMappingsActionProcessor } from '../../../../processors';
import { BaseGroupRoleMappingsActionHandler } from './BaseGroupRoleMappingsActionHandler';

export class GroupDeleteRoleMappingsActionHandler extends BaseGroupRoleMappingsActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupDeleteRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
