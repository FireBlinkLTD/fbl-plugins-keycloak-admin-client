import RoleRepresentation from 'keycloak-admin/lib/defs/roleRepresentation';

export interface ICompositeRoleMappingRepresentation {
    realm: RoleRepresentation[];
    client: {
        [clientId: string]: RoleRepresentation[];
    };
}
