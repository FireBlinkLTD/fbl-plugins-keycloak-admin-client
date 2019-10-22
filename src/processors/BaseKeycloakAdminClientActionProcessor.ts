import { ActionProcessor, ActionError } from 'fbl';
import KeycloakAdminClient from 'keycloak-admin';
import { ICredentials } from '../interfaces';
import * as request from 'request';
import ClientRepresentation from 'keycloak-admin/lib/defs/clientRepresentation';

export abstract class BaseKeycloakAdminClientActionProcessor extends ActionProcessor {
    /**
     * Create new instance of `keycloak-admin` client and authenticate with provided credentials
     * // TODO: assign client to class variable
     */
    async getKeycloakAdminClient(credentials: ICredentials): Promise<KeycloakAdminClient> {
        const client = new KeycloakAdminClient(credentials);
        await client.auth(credentials);

        return client;
    }

    /**
     * Wrap keyaloack API request for better handling of error response
     * @param fn
     */
    async wrapKeycloakAdminRequest(fn: Function): Promise<any> {
        try {
            return await fn();
        } catch (e) {
            /* istanbul ignore else */
            if (e.response && e.response.data && e.response.data.errorMessage) {
                throw new ActionError(`${e.message}: ${e.response.data.errorMessage}`, e.response.status.toString());
            }

            throw e;
        }
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
                        message: `Error`,
                        response: {
                            status: resp.statusCode,
                            data: {
                                errorMessage: `Request failed: ${resp.statusCode} - ${resp.statusMessage}`,
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

    /**
     * Find client
     * @param adminClient
     * @param realm
     * @param clientId
     */
    async findClient(adminClient: KeycloakAdminClient, realm: string, clientId: string): Promise<ClientRepresentation> {
        const clients = await this.wrapKeycloakAdminRequest(async () => {
            return await adminClient.clients.find({
                clientId,
                realm,
            });
        });

        if (!clients.length) {
            throw new ActionError(`Client with clientId "${clientId}" of realm "${realm}" not found`, '404');
        }

        return clients[0];
    }
}
