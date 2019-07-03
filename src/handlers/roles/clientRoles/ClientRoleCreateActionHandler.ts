import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientRoleCreateActionProcessor } from '../../../processors';
import { BaseClientRoleActionHandler } from './BaseClientRoleActionHandler';

export class ClientRoleCreateActionHandler extends BaseClientRoleActionHandler {
    get action(): string {
        return 'create';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientRoleCreateActionProcessor(options, context, snapshot, parameters);
    }
}
