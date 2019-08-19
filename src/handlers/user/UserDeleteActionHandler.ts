import { BaseUserActionHandler } from './BaseUserActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { UserDeleteActionProcessor } from '../../processors';

export class UserDeleteActionHandler extends BaseUserActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserDeleteActionProcessor(options, context, snapshot, parameters);
    }
}
