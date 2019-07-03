import { ActionProcessor, IContext, ActionSnapshot, IDelegatedParameters } from 'fbl';
import { ClientRoleGetActionProcessor } from '../../../processors';
import { BaseClientRoleActionHandler } from './BaseClientRoleActionHandler';

export class ClientRoleGetActionHandler extends BaseClientRoleActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientRoleGetActionProcessor(options, context, snapshot, parameters);
    }
}
