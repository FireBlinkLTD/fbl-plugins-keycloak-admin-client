import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { BaseGroupMappingsClientRolesActionHandler } from './BaseGroupMappingsClientRolesActionHandler';
import { GroupDeleteClientRoleMappingsActionProcessor } from '../../../../../processors';

export class GroupDeleteClientRoleMappingsActionHandler extends BaseGroupMappingsClientRolesActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupDeleteClientRoleMappingsActionProcessor(options, context, snapshot, parameters);
    }
}
