import { BaseGroupActionHandler } from './BaseGroupActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { GroupDeleteActionProcessor } from '../../processors';

export class GroupDeleteActionHandler extends BaseGroupActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupDeleteActionProcessor(options, context, snapshot, parameters);
    }
}
