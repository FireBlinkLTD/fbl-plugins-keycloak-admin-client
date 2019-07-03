import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientRoleUpdateActionProcessor } from '../../../processors';
import { BaseClientRoleActionHandler } from './BaseClientRoleActionHandler';

export class ClientRoleUpdateActionHandler extends BaseClientRoleActionHandler {
    get action(): string {
        return 'update';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientRoleUpdateActionProcessor(options, context, snapshot, parameters);
    }
}
