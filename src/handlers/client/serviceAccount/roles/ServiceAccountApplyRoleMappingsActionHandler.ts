import { IContext, ActionSnapshot, IDelegatedParameters, ActionProcessor } from 'fbl';
import { ClientApplyServiceAccountUserActionProcessor } from '../../../../processors';
import { BaseServiceAccountRoleMappingsActionHandler } from './BaseServiceAccountRoleMappingsActionHandler';

export class ServiceAccountApplyRoleMappingsActionHandler extends BaseServiceAccountRoleMappingsActionHandler {
    get action(): string {
        return 'apply';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientApplyServiceAccountUserActionProcessor(options, context, snapshot, parameters);
    }
}
