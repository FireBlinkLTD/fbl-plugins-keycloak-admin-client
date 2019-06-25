import { ActionHandler, IActionHandlerMetadata } from 'fbl';

export abstract class BaseActionHandler extends ActionHandler {
    protected abstract get group(): string;
    protected abstract get action(): string;

    getMetadata(): IActionHandlerMetadata {
        return {
            id: `com.fireblink.fbl.plugins.keycloak.admin.client.${this.group}.${this.action}`,
            aliases: [
                `fbl.plugins.keycloak.admin.client.realm.${this.group}.${this.action}`,
                `keycloak.${this.group}.${this.action}`,
            ],
        };
    }
}
