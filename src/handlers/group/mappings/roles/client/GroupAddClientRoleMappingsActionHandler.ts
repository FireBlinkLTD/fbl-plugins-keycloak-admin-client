import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseGroupMappingsClientRolesActionHandler } from './BaseGroupMappingsClientRolesActionHandler';
import { GroupAddClientRoleMappingsActionProcessor } from '../../../../../processors';

export class GroupAddClientRoleMappingsActionHandler extends BaseGroupMappingsClientRolesActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupAddClientRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
