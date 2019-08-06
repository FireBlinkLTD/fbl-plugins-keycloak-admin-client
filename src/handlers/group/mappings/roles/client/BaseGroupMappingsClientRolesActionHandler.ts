import { BaseActionHandler } from '../../../../BaseActionHandler';

export abstract class BaseGroupMappingsClientRolesActionHandler extends BaseActionHandler {
    get group(): string {
        return 'group.mappings.client.roles';
    }
}
