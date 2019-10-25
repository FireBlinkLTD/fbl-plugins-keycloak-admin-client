import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { GroupApplyRoleMappingsActionProcessor } from '../../../../processors';
import { BaseGroupRoleMappingsActionHandler } from './BaseGroupRoleMappingsActionHandler';

export class GroupApplyRoleMappingsActionHandler extends BaseGroupRoleMappingsActionHandler {
    get action(): string {
        return 'apply';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupApplyRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
