import { Credentials as KeycloakCredentials } from 'keycloak-admin/lib/utils/auth';
import { ConnectionConfig } from 'keycloak-admin/lib/client';

export interface ICredentials extends KeycloakCredentials, ConnectionConfig {}
