import { BaseClientSecretActionHandler } from './BaseClientSecretActionHandler';
import { ActionSnapshot, IDelegatedParameters, ActionProcessor, IContext } from 'fbl';
import { ClientSecretGenerateActionProcessor } from '../../../processors';

export class ClientSecretGenerateActionHandler extends BaseClientSecretActionHandler {
    get action(): string {
        return 'generate';
    }

    getProcessor(
        options: any,
        context: IContext,
        snapshot: ActionSnapshot,
        parameters: IDelegatedParameters,
    ): ActionProcessor {
        return new ClientSecretGenerateActionProcessor(options, context, snapshot, parameters);
    }
}
