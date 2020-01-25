import { ActionError } from 'fbl';
import { BaseActionProcessor } from './base';

export abstract class BaseKeycloakAdminClientActionProcessor extends BaseActionProcessor {
    async execute(): Promise<void> {
        try {
            return await this.process();
        } catch (e) {
            /* istanbul ignore else */
            if (e.response && e.response.data) {
                /* istanbul ignore next */
                throw new ActionError(
                    `${e.message}: ${JSON.stringify(e.response.data.errorMessage || e.response.data)}`,
                    e.response.status.toString(),
                );
            }

            throw e;
        }
    }

    /**
     * Process action handler logic.
     * Note: method should be used instead of execute().
     */
    abstract async process(): Promise<void>;
}
