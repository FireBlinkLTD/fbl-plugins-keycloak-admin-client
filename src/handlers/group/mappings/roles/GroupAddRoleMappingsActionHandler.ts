import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { BaseGroupRoleMappingsActionHandler } from './BaseGroupRoleMappingsActionHandler';
import { GroupAddRoleMappingsActionProcessor } from '../../../../processors';

export class GroupAddRoleMappingsActionHandler extends BaseGroupRoleMappingsActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupAddRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
