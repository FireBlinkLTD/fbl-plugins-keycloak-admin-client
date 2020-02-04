import { KeycloakClient } from '../KeycloakClient';
import { BaseResourceRepresentation } from './BaseResourceRepresentation';

export class KeycloakGroupsResource extends BaseResourceRepresentation {
    constructor(keycloakClient: KeycloakClient) {
        super(keycloakClient, 'groups');
    }

    public async listRoleMappings(realm: string, id: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/groups/${id}/role-mappings`);
    }

    public async addClientRoleMappings(realm: string, id: string, clientUniqueId: string, roles: any) {
        return await this.keycloakClient.post(
            `/admin/realms/${realm}/groups/${id}/role-mappings/clients/${clientUniqueId}`,
            roles,
        );
    }

    public async delClientRoleMappings(realm: string, id: string, clientUniqueId: string, roles: any) {
        return await this.keycloakClient.post(
            `/admin/realms/${realm}/groups/${id}/role-mappings/clients/${clientUniqueId}`,
            roles,
        );
    }

    public async addRealmRoleMappings(realm: string, id: string, roles: any) {
        return await this.keycloakClient.post(`/admin/realms/${realm}/groups/${id}/role-mappings/realm`, roles);
    }

    public async delRealmRoleMappings(realm: string, id: string, roles: any) {
        return await this.keycloakClient.post(`/admin/realms/${realm}/groups/${id}/role-mappings/realm`, roles);
    }
}
