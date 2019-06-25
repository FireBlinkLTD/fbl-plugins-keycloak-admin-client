import { BaseClientActionHandler } from './BaseClientActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientDeleteActionProcessor } from '../../processors';

export class ClientDeleteActionHandler extends BaseClientActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientDeleteActionProcessor(options, context, snapshot, parameters);
    }
}
