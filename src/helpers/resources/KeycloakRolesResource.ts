import { KeycloakClient } from '../KeycloakClient';
import { BaseResourceRepresentation } from './BaseResourceRepresentation';

export class KeycloakRolesResource extends BaseResourceRepresentation {
    constructor(keycloakClient: KeycloakClient) {
        super(keycloakClient, 'roles');
    }
}
