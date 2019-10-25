import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { ClientDeleteServiceAccountUserActionProcessor } from '../../../../processors';
import { BaseServiceAccountRoleMappingsActionHandler } from './BaseServiceAccountRoleMappingsActionHandler';

export class ServiceAccountDeleteRoleMappingsActionHandler extends BaseServiceAccountRoleMappingsActionHandler {
    get action(): string {
        return 'delete';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientDeleteServiceAccountUserActionProcessor(options, context, snapshot, parameters);
    }
}
