import * as request from 'superagent';
import { ActionError, ActionSnapshot } from 'fbl';
import { KeycloakClientsResource } from './resources/KeycloakClientsResource';
import { KeycloakUsersResource } from './resources/KeycloakUsersResource';
import { KeycloakGroupsResource } from './resources/KeycloakGroupsResource';
import { KeycloakRolesResource } from './resources/KeycloakRolesResource';
import { KeycloakRealmsResource } from './resources/KeycloakRealmsResource';

interface IRequestOptions {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    qs?: Record<string, string>;
    form?: boolean;
    body?: any;
    auth?: {
        bearer: string
    };
}

export class KeycloakClient {
    static DEFAULT_TIMEOUT = 30 * 1000;
    static DEFAULT_USER_AGENT = '@fbl-plugins/keycloak-admin-client';

    public accessToken: string;

    constructor(private credentials: any, private snapshot: ActionSnapshot) {}

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
        const req: IRequestOptions = {
            form: true,
            body: {
                username: this.credentials.username,
                password: this.credentials.password,
                grant_type: this.credentials.grantType,
                client_id: this.credentials.clientId,
            },
            method: 'POST',
        };

        const body = await this.makeRequest(
            `/realms/${this.credentials.realmName || 'master'}/protocol/openid-connect/token`,
            req,
        );
        this.accessToken = body.access_token;
    }

    private get timeout(): number {
        return (
            (this.credentials.requestConfig && this.credentials.requestConfig.timeout) || KeycloakClient.DEFAULT_TIMEOUT
        );
    }

    private get userAgent(): string {
        return (
            (this.credentials.requestConfig && this.credentials.requestConfig.userAgent) ||
            KeycloakClient.DEFAULT_USER_AGENT
        );
    }

    /**
     * Make POST Keycloak API request
     * @param uri
     * @param body
     */
    async post(uri: string, body: any, qs: any = {}): Promise<any> {
        const req: IRequestOptions = {
            auth: {
                bearer: this.accessToken,
            },
            body,
            qs,
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
        const req: IRequestOptions = {
            auth: {
                bearer: this.accessToken,
            },
            body,
            qs,
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
        const req: IRequestOptions = {
            auth: {
                bearer: this.accessToken,
            },
            qs,
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
        const req: IRequestOptions = {
            auth: {
                bearer: this.accessToken,
            },
            body,
            qs,
            method: 'DELETE',
        };

        return await this.makeRequest(uri, req);
    }

    private async makeRequest(uri: string, options: IRequestOptions): Promise<any> {
        this.snapshot.log(`Making ${options.method} request to ${uri} qs: ${JSON.stringify(options.qs || {})}`);

        let req = request(options.method, `${this.credentials.baseUrl}${uri}`)
            .timeout(this.timeout)
            .ok(() => true)
            .set('Accept', 'application/json')
            .set('User-Agent', this.userAgent);

        if (options.auth) {
            req = req.set('Authorization', `Bearer ${options.auth.bearer}`);
        }

        if (options.qs) {
            req = req.query(options.qs);
        }

        if (options.form) {
            req = req.type('form');
        }

        if (options.body) {
            req = req.send(options.body);
        }

        const resp = await req;

        if (!resp.ok) {
            let errorMessage = `Request failed with status code ${resp.status}`;

            /* istanbul ignore else */
            if (resp.body) {
                this.snapshot.log(`Failed response body: ${JSON.stringify(resp.body, null, 2)}`, true, false);

                if (resp.body.errorMessage) {
                    errorMessage += `: "${resp.body.errorMessage}"`;
                }
            }

            throw new ActionError(errorMessage, resp.status.toString());
        }

        this.snapshot.log(`${options.method} request to ${uri} completed with status code: ${resp.status}`);

        return resp.body;
    }
}
