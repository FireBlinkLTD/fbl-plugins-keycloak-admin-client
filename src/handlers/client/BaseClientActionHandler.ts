import { BaseActionHandler } from '../BaseActionHandler';

export abstract class BaseClientActionHandler extends BaseActionHandler {
    get group(): string {
        return 'client';
    }
}
