import { BaseUserActionHandler } from './BaseUserActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { UserGetActionProcessor } from '../../processors';

export class UserGetActionHandler extends BaseUserActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new UserGetActionProcessor(options, context, snapshot, parameters);
    }
}
