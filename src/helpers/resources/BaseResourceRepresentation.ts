import { KeycloakClient } from '../KeycloakClient';

export abstract class BaseResourceRepresentation {
    constructor(protected keycloakClient: KeycloakClient, private resourceName: string) {}

    async find(realm: string, qs: any) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/${this.resourceName}`, qs);
    }

    async findOne(realm: string, id: string) {
        return await this.keycloakClient.get(`/admin/realms/${realm}/${this.resourceName}/${id}`);
    }

    async create(realm: string, resourceRepresentation: any) {
        return await this.keycloakClient.post(`/admin/realms/${realm}/${this.resourceName}`, resourceRepresentation);
    }

    async delete(realm: string, id: string) {
        return await this.keycloakClient.delete(`/admin/realms/${realm}/${this.resourceName}/${id}`);
    }

    async update(realm: string, id: string, resourceRepresentation: any) {
        return await this.keycloakClient.put(
            `/admin/realms/${realm}/${this.resourceName}/${id}`,
            resourceRepresentation,
        );
    }
}
