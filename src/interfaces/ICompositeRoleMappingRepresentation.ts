export interface ICompositeRoleMappingRepresentation {
    realm: any[];
    client: {
        [clientId: string]: any[];
    };
}
