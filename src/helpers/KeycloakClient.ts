import { ICredentials } from '../interfaces';
import * as request from 'request';
import { ActionError, ActionSnapshot } from 'fbl';
import { KeycloakClientsResource } from './resources/KeycloakClientsResource';
import { KeycloakUsersResource } from './resources/KeycloakUsersResource';
import { KeycloakGroupsResource } from './resources/KeycloakGroupsResource';
import { KeycloakRolesResource } from './resources/KeycloakRolesResource';
import { KeycloakRealmsResource } from './resources/KeycloakRealmsResource';

export class KeycloakClient {
    static DEFAULT_TIMEOUT = 30 * 1000;
    public accessToken: string;

    constructor(
        private credentials: ICredentials,
        private snapshot: ActionSnapshot,
    ) {

    }

    public get clients(): KeycloakClientsResource {
        return new KeycloakClientsResource(this);
    }

    public get users(): KeycloakUsersResource {
        return new KeycloakUsersResource(this);
    }

    public get groups(): KeycloakGroupsResource {
        return new KeycloakGroupsResource(this);
    }

    public get roles(): KeycloakRolesResource {
        return new KeycloakRolesResource(this);
    }

    public get realms(): KeycloakRealmsResource {
        return new KeycloakRealmsResource(this);
    }

    public async auth(): Promise<void> {
        const req: request.CoreOptions = {
            json: true,
            form: {
                username: this.credentials.username,
                password: this.credentials.password,
                grant_type: this.credentials.grantType,
                client_id: this.credentials.clientId,
            },
            timeout: this.timeout,
            method: 'POST',
        };

        const body = await this.makeRequest(`/realms/${this.credentials.realmName || 'master'}/protocol/openid-connect/token`, req);
        this.accessToken = body.access_token;
    }

    private get timeout(): number {
        return (this.credentials.requestConfig && this.credentials.requestConfig.timeout)
            || KeycloakClient.DEFAULT_TIMEOUT;
    }

    /**
     * Make POST Keycloak API request
     * @param uri
     * @param body
     */
    async post(uri: string, body: any, qs: any = {}): Promise<any> {
        const req: request.CoreOptions = {
            auth: {
                bearer: this.accessToken,
            },
            json: true,
            body,
            qs,
            timeout: this.timeout,
            method: 'POST',
        };

        return await this.makeRequest(uri, req);
    }

    /**
     * Make PUT Keycloak API request
     * @param uri
     * @param qs
     * @param body
     */
    async put(uri: string, body: any, qs: any = {}): Promise<any> {
        const req: request.CoreOptions = {
            auth: {
                bearer: this.accessToken,
            },
            json: true,
            body,
            qs,
            timeout: this.timeout,
            method: 'PUT',
        };

        return await this.makeRequest(uri, req);
    }

    /**
     * Make GET Keycloak API request
     * @param uri
     * @param qs
     */
    async get(uri: string, qs: any = {}): Promise<any> {
        const req: request.CoreOptions = {
            auth: {
                bearer: this.accessToken,
            },
            qs,
            json: true,
            timeout: this.timeout,
            method: 'GET',
        };

        return await this.makeRequest(uri, req);
    }

    /**
     * Make DELETE Keycloak API request
     * @param uri
     * @param qs
     * @param body
     */
    async delete(uri: string, qs: any = {}, body?: any): Promise<any> {
        const req: request.CoreOptions = {
            auth: {
                bearer: this.accessToken,
            },
            body,
            qs,
            json: true,
            timeout: this.timeout,
            method: 'DELETE',
        };

        return await this.makeRequest(uri, req);
    }

    private makeRequest(uri: string, req: request.CoreOptions): Promise<any> {
        return new Promise((resolve, reject) => {
            request(`${this.credentials.baseUrl}${uri}`, req, (err, resp, responseBody) => {
                /* istanbul ignore next */
                if (err) {
                    return reject(err);
                }

                if (resp.statusCode >= 200 && resp.statusCode < 300) {
                    return resolve(responseBody);
                }

                let errorMessage = `Request failed with status code ${resp.statusCode}`;

                /* istanbul ignore else */
                if (responseBody) {
                    this.snapshot.log(`Failed response body: ${JSON.stringify(responseBody, null, 2)}`, true, false);

                    if (responseBody.errorMessage) {
                        errorMessage += `: "${responseBody.errorMessage}"`;
                    }
                }


                return reject(
                    new ActionError(errorMessage, resp.statusCode.toString()),
                );
            });
        });
    }
}
