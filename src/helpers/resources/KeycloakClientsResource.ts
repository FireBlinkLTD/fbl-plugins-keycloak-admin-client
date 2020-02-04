import { KeycloakClient } from '../KeycloakClient';
import { BaseResourceRepresentation } from './BaseResourceRepresentation';

export class KeycloakClientsResource extends BaseResourceRepresentation {
    constructor(keycloakClient: KeycloakClient) {
        super(keycloakClient, 'clients');
    }

    async createRole(realm: string, id: string, roleRepresentation: any) {
        return await this.keycloakClient.post(`/admin/realms/${realm}/clients/${id}/roles`, roleRepresentation);
    }

    async deleteRole(realm: string, id: string, roleName: string) {
        return await this.keycloakClient.delete(`/admin/realms/${realm}/clients/${id}/roles/${roleName}`);
    }

    async updateRole(realm: string, id: string, roleName: string, roleRepresentation: any) {
        return await this.keycloakClient.put(
            `/admin/realms/${realm}/clients/${id}/roles/${roleName}`,
            roleRepresentation,
        );
    }

    async listRoles(realm: string, id: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/clients/${id}/roles`);
    }

    async findRole(realm: string, id: string, roleName: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/clients/${id}/roles/${roleName}`);
    }

    async getServiceAccountUser(realm: string, id: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/clients/${id}/service-account-user`);
    }
}
