import { KeycloakClient } from '../KeycloakClient';
import { BaseResourceRepresentation } from './BaseResourceRepresentation';

export class KeycloakUsersResource extends BaseResourceRepresentation {
    constructor(keycloakClient: KeycloakClient) {
        super(keycloakClient, 'users');
    }

    public async listRoleMappings(realm: string, id: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/users/${id}/role-mappings`);
    }

    public async addClientRoleMappings(realm: string, id: string, clientUniqueId: string, roles: any) {
        return await this.keycloakClient.post(
            `/admin/realms/${realm}/users/${id}/role-mappings/clients/${clientUniqueId}`,
            roles,
        );
    }

    public async delClientRoleMappings(realm: string, id: string, clientUniqueId: string, roles: any) {
        return await this.keycloakClient.delete(
            `/admin/realms/${realm}/users/${id}/role-mappings/clients/${clientUniqueId}`,
            {},
            roles,
        );
    }

    public async addRealmRoleMappings(realm: string, id: string, roles: any) {
        return await this.keycloakClient.post(`/admin/realms/${realm}/users/${id}/role-mappings/realm`, roles);
    }

    public async delRealmRoleMappings(realm: string, id: string, roles: any) {
        return await this.keycloakClient.delete(`/admin/realms/${realm}/users/${id}/role-mappings/realm`, {}, roles);
    }

    public async addToGroup(realm: string, id: string, groupId: string) {
        return await this.keycloakClient.put(`/admin/realms/${realm}/users/${id}/groups/${groupId}`, {});
    }

    public async deleteFromGroup(realm: string, id: string, groupId: string) {
        return await this.keycloakClient.delete(`/admin/realms/${realm}/users/${id}/groups/${groupId}`);
    }

    public async listGroups(realm: string, id: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/users/${id}/groups`);
    }
}
