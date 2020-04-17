import { BaseActionHandler } from '../../BaseActionHandler';

export abstract class BaseClientSecretActionHandler extends BaseActionHandler {
    get group(): string {
        return 'client.secret';
    }
}
