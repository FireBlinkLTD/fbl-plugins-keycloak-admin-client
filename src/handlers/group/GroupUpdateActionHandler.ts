import { BaseGroupActionHandler } from './BaseGroupActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { GroupUpdateActionProcessor } from '../../processors';

export class GroupUpdateActionHandler extends BaseGroupActionHandler {
    get action(): string {
        return 'update';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupUpdateActionProcessor(options, context, snapshot, parameters);
    }
}
