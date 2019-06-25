import { BaseClientActionHandler } from './BaseClientActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientUpdateActionProcessor } from '../../processors';

export class ClientUpdateActionHandler extends BaseClientActionHandler {
    get action(): string {
        return 'update';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientUpdateActionProcessor(options, context, snapshot, parameters);
    }
}
