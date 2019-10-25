import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { GroupGetRoleMappingsActionProcessor } from '../../../../processors';
import { BaseGroupRoleMappingsActionHandler } from './BaseGroupRoleMappingsActionHandler';
export class GroupGetRoleMappingsActionHandler extends BaseGroupRoleMappingsActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupGetRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
