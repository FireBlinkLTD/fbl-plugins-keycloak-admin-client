import { ActionProcessor } from 'fbl';
import KeycloakAdminClient from 'keycloak-admin';
import { ICredentials } from '../../interfaces';
import * as request from 'request';

export abstract class BaseConnectionActionProcessor extends ActionProcessor {
    /**
     * Create new instance of `keycloak-admin` client and authenticate with provided credentials
     * @param credentials
     */
    async getKeycloakAdminClient(credentials: ICredentials): Promise<KeycloakAdminClient> {
        const credentialsWithTimeout = { ...credentials };

        if (!credentialsWithTimeout.requestConfig) {
            credentialsWithTimeout.requestConfig = {};
        }

        if (!credentialsWithTimeout.requestConfig.timeout && credentialsWithTimeout.requestConfig !== 0) {
            credentialsWithTimeout.requestConfig.timeout = 30 * 1000;
        }

        const client = new KeycloakAdminClient(credentials);
        this.snapshot.log('Authenticating.');
        await client.auth(credentials);
        this.snapshot.log('Successfully authenticated.');

        return client;
    }

    /**
     * Make Keycloak API request
     * @param client
     * @param endpoint
     * @param method
     * @param body
     */
    private async request(client: KeycloakAdminClient, endpoint: string, method = 'GET', body?: any): Promise<any> {
        return await new Promise((resolve, reject) => {
            const req = {
                auth: {
                    bearer: client.getAccessToken(),
                },
                json: true,
                body,
                method,
                url: `${client.baseUrl}${endpoint}`,
            };

            request(req, (err, resp, responseBody) => {
                /* istanbul ignore next */
                if (err) {
                    return reject(err);
                }

                if (resp.statusCode >= 200 && resp.statusCode < 300) {
                    return resolve(responseBody);
                }

                /* istanbul ignore else */
                if (!responseBody) {
                    responseBody = {
                        message: `Request failed with status code ${resp.statusCode}`,
                        response: {
                            status: resp.statusCode,
                            data: {
                                errorMessage: resp.statusMessage,
                            },
                        },
                    };
                }

                return reject(responseBody);
            });
        });
    }

    /**
     * Make POST Keycloak API request
     * @param client
     * @param endpoint
     * @param body
     */
    async post(client: KeycloakAdminClient, endpoint: string, body: any): Promise<any> {
        return await this.request(client, endpoint, 'POST', body);
    }

    /**
     * Make GET Keycloak API request
     * @param client
     * @param endpoint
     */
    async get(client: KeycloakAdminClient, endpoint: string): Promise<any> {
        return await this.request(client, endpoint);
    }

    /**
     * Make DELETE Keycloak API request
     * @param client
     * @param endpoint
     * @param body
     */
    async delete(client: KeycloakAdminClient, endpoint: string, body?: any): Promise<any> {
        return await this.request(client, endpoint, 'DELETE', body);
    }
}
