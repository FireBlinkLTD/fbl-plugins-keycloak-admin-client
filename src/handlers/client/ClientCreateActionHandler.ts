import { BaseClientActionHandler } from './BaseClientActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientCreateActionProcessor } from '../../processors';

export class ClientCreateActionHandler extends BaseClientActionHandler {
    get action(): string {
        return 'create';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientCreateActionProcessor(options, context, snapshot, parameters);
    }
}
