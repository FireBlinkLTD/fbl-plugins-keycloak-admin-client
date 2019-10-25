import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { ClientGetServiceAccountUserActionProcessor } from '../../../../processors';
import { BaseServiceAccountRoleMappingsActionHandler } from './BaseServiceAccountRoleMappingsActionHandler';

export class ServiceAccountGetRoleMappingsActionHandler extends BaseServiceAccountRoleMappingsActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientGetServiceAccountUserActionProcessor(options, context, snapshot, parameters);
    }
}
