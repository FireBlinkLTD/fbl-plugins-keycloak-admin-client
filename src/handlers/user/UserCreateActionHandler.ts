import { BaseUserActionHandler } from './BaseUserActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { UserCreateActionProcessor } from '../../processors';

export class UserCreateActionHandler extends BaseUserActionHandler {
    get action(): string {
        return 'create';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserCreateActionProcessor(options, context, snapshot, parameters);
    }
}
