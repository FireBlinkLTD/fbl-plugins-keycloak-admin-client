import { BaseGroupActionHandler } from './BaseGroupActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { GroupGetActionProcessor } from '../../processors';

export class GroupGetActionHandler extends BaseGroupActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new GroupGetActionProcessor(options, context, snapshot, parameters);
    }
}
