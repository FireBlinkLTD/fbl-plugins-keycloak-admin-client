import { BaseClientSecretActionHandler } from './BaseClientSecretActionHandler';
import { ActionSnapshot, IDelegatedParameters, ActionProcessor, IContext } from 'fbl';
import { ClientSecretGetActionProcessor } from '../../../processors';

export class ClientSecretGetActionHandler extends BaseClientSecretActionHandler {
    get action(): string {
        return 'get';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientSecretGetActionProcessor(options, context, snapshot, parameters);
    }
}
