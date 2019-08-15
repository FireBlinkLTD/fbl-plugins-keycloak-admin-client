import { BaseUserActionHandler } from './BaseUserActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { UserUpdateActionProcessor } from '../../processors';

export class UserUpdateActionHandler extends BaseUserActionHandler {
    get action(): string {
        return 'update';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserUpdateActionProcessor(options, context, snapshot, parameters);
    }
}
