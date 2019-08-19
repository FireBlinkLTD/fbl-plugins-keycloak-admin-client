import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { UserDeleteFromGroupActionProcessor } from '../../../../processors';
import { BaseUserGroupActionHandler } from './BaseUserGroupActionHandler';

export class UserDeleteFromGroupActionHandler extends BaseUserGroupActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserDeleteFromGroupActionProcessor(options, context, snapshot, parameters);
    }
}
