import { BaseClientActionHandler } from './BaseClientActionHandler';
import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientGetActionProcessor } from '../../processors';

export class ClientGetActionHandler extends BaseClientActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientGetActionProcessor(options, context, snapshot, parameters);
    }
}
