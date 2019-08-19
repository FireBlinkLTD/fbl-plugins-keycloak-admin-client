import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { UserGetGroupsActionProcessor } from '../../../../processors';
import { BaseUserGroupActionHandler } from './BaseUserGroupActionHandler';

export class UserGetGroupsActionHandler extends BaseUserGroupActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserGetGroupsActionProcessor(options, context, snapshot, parameters);
    }
}
