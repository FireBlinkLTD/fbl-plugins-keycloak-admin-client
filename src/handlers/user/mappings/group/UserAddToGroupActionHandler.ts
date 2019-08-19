import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { UserAddToGroupActionProcessor } from '../../../../processors';
import { BaseUserGroupActionHandler } from './BaseUserGroupActionHandler';

export class UserAddToGroupActionHandler extends BaseUserGroupActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserAddToGroupActionProcessor(options, context, snapshot, parameters);
    }
}
