import { KeycloakClient } from '../KeycloakClient';

export class KeycloakRealmsResource {
    constructor(private keycloakClient: KeycloakClient) {}

    async findOne(realm: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}`);
    }

    async create(resourceRepresentation: any) {
        return await this.keycloakClient.post('/admin/realms', resourceRepresentation);
    }

    async delete(realm: string) {
        return await this.keycloakClient.delete(`/admin/realms/${realm}`);
    }

    async update(realm: string, resourceRepresentation: any) {
        return await this.keycloakClient.put(`/admin/realms/${realm}`, resourceRepresentation);
    }

    async getEventsConfig(realm: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/events/config`);
    }

    async updateEventsConfig(realm: string, resourceRepresentation: any) {
        return await this.keycloakClient.put(`/admin/realms/${realm}/events/config`, resourceRepresentation);
    }
}
