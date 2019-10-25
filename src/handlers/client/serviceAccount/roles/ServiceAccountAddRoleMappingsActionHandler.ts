import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { BaseServiceAccountRoleMappingsActionHandler } from './BaseServiceAccountRoleMappingsActionHandler';
import { ClientAddServiceAccountUserActionProcessor } from '../../../../processors';

export class ServiceAccountAddRoleMappingsActionHandler extends BaseServiceAccountRoleMappingsActionHandler {
    get action(): string {
        return 'add';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientAddServiceAccountUserActionProcessor(options, context, snapshot, parameters);
    }
}
