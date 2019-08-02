import { BaseGroupActionHandler } from '../../BaseGroupActionHandler';
import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { GroupGetRoleMappingsActionProcessor } from '../../../../processors';

export class GroupGetRoleMappingsActionHandler extends BaseGroupActionHandler {
    get group(): string {
        return 'group.mappings.roles';
    }

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
