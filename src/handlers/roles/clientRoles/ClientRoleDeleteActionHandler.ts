import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientRoleDeleteActionProcessor } from '../../../processors';
import { BaseClientRoleActionHandler } from './BaseClientRoleActionHandler';

export class ClientRoleDeleteActionHandler extends BaseClientRoleActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientRoleDeleteActionProcessor(options, context, snapshot, parameters);
    }
}
