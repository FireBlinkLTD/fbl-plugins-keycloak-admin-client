import { BaseGroupActionHandler } from './BaseGroupActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { GroupCreateActionProcessor } from '../../processors';

export class GroupCreateActionHandler extends BaseGroupActionHandler {
    get action(): string {
        return 'create';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupCreateActionProcessor(options, context, snapshot, parameters);
    }
}
