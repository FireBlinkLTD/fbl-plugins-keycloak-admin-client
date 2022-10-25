import { ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import {
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
    RealmRoleCreateActionHandler,
    ServiceAccountAddRoleMappingsActionHandler,
    ServiceAccountApplyRoleMappingsActionHandler,
    ServiceAccountDeleteRoleMappingsActionHandler,
    ServiceAccountGetRoleMappingsActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class ClientServiceAccountRolesMappingsActionHandlersTestSuite {
    after() {
        ActionHandlersRegistry.instance.cleanup();
    }

    @test()
    async allOperations(): Promise<void> {
        const clientId = `c-${Date.now()}`;
        const realmRole1 = `rr1-${Date.now()}`;
        const realmRole2 = `rr2-${Date.now()}`;
        const clientRole1 = `cr1-${Date.now()}`;
        const clientRole2 = `cr2-${Date.now()}`;

        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountAddRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountApplyRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountDeleteRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountGetRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
                    // create realm roles
                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: realmRole1,
                            },
                        },
                    },
                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: realmRole2,
                            },
                        },
                    },

                    // create client & roles
                    {
                        'keycloak.client.create': {
                            credentials,
                            realmName,
                            client: {
                                clientId,
                                enabled: true,
                                serviceAccountsEnabled: true,
                            },
                        },
                    },
                    {
                        'keycloak.client.role.create': {
                            credentials,
                            realmName,
                            clientId,
                            role: {
                                name: clientRole1,
                            },
                        },
                    },
                    {
                        'keycloak.client.role.create': {
                            credentials,
                            realmName,
                            clientId,
                            role: {
                                name: clientRole2,
                            },
                        },
                    },

                    // add roles
                    {
                        'keycloak.client.service.account.mappings.roles.add': {
                            credentials,
                            realmName,
                            clientId,
                            roles: {
                                realm: [realmRole1],
                                client: {
                                    [clientId]: [clientRole1],
                                },
                            },
                        },
                    },
                    {
                        'keycloak.client.service.account.mappings.roles.get': {
                            credentials,
                            realmName,
                            clientId,
                            assignRoleMappingsTo: '$.ctx.afterAdd',
                        },
                    },

                    // apply roles
                    {
                        'keycloak.client.service.account.mappings.roles.apply': {
                            credentials,
                            realmName,
                            clientId,
                            roles: {
                                realm: [realmRole2],
                                client: {
                                    [clientId]: [clientRole2],
                                },
                            },
                        },
                    },

                    {
                        'keycloak.client.service.account.mappings.roles.get': {
                            credentials,
                            realmName,
                            clientId,
                            assignRoleMappingsTo: '$.ctx.afterApply',
                        },
                    },

                    // delete roles
                    {
                        'keycloak.client.service.account.mappings.roles.delete': {
                            credentials,
                            realmName,
                            clientId,
                            roles: {
                                realm: [realmRole2],
                                client: {
                                    [clientId]: [clientRole2],
                                },
                            },
                        },
                    },

                    {
                        'keycloak.client.service.account.mappings.roles.get': {
                            credentials,
                            realmName,
                            clientId,
                            assignRoleMappingsTo: '$.ctx.afterDelete',
                        },
                    },
                ],
            },
            context,
            {},
        );

        assert(snapshot.successful);

        context.ctx.afterAdd.realm.sort();
        assert.deepStrictEqual(context.ctx.afterAdd, {
            realm: ['default-roles-master', realmRole1],
            client: {
                [clientId]: [clientRole1],
            },
        });

        assert.deepStrictEqual(context.ctx.afterApply, {
            realm: [realmRole2],
            client: {
                [clientId]: [clientRole2],
            },
        });

        assert.deepStrictEqual(context.ctx.afterDelete, {
            realm: [],
            client: {},
        });
    }

    @test()
    async applyEmpty(): Promise<void> {
        const clientId = `c-${Date.now()}`;
        const realmRole1 = `rr1-${Date.now()}`;
        const realmRole2 = `rr2-${Date.now()}`;
        const clientRole1 = `cr1-${Date.now()}`;
        const clientRole2 = `cr2-${Date.now()}`;

        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountAddRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountApplyRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountDeleteRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountGetRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
                    // create realm roles
                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: realmRole1,
                            },
                        },
                    },
                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: realmRole2,
                            },
                        },
                    },

                    // create client & roles
                    {
                        'keycloak.client.create': {
                            credentials,
                            realmName,
                            client: {
                                clientId,
                                enabled: true,
                                serviceAccountsEnabled: true,
                            },
                        },
                    },
                    {
                        'keycloak.client.role.create': {
                            credentials,
                            realmName,
                            clientId,
                            role: {
                                name: clientRole1,
                            },
                        },
                    },
                    {
                        'keycloak.client.role.create': {
                            credentials,
                            realmName,
                            clientId,
                            role: {
                                name: clientRole2,
                            },
                        },
                    },

                    // add roles
                    {
                        'keycloak.client.service.account.mappings.roles.add': {
                            credentials,
                            realmName,
                            clientId,
                            roles: {
                                realm: [realmRole1],
                                client: {
                                    [clientId]: [clientRole1],
                                },
                            },
                        },
                    },
                    {
                        'keycloak.client.service.account.mappings.roles.get': {
                            credentials,
                            realmName,
                            clientId,
                            assignRoleMappingsTo: '$.ctx.afterAdd',
                        },
                    },

                    // apply roles
                    {
                        'keycloak.client.service.account.mappings.roles.apply': {
                            credentials,
                            realmName,
                            clientId,
                            roles: {},
                        },
                    },

                    {
                        'keycloak.client.service.account.mappings.roles.get': {
                            credentials,
                            realmName,
                            clientId,
                            assignRoleMappingsTo: '$.ctx.afterApply',
                        },
                    },
                ],
            },
            context,
            {},
        );

        assert(snapshot.successful);

        context.ctx.afterAdd.realm.sort();
        assert.deepStrictEqual(context.ctx.afterAdd, {
            realm: ['default-roles-master', realmRole1],
            client: {
                [clientId]: [clientRole1],
            },
        });

        assert.deepStrictEqual(context.ctx.afterApply, {
            realm: [],
            client: {},
        });
    }

    @test()
    async failToAddRoleForNonServiceAccountClient(): Promise<void> {
        const clientId = `c-${Date.now()}`;
        const realmRole1 = `rr1-${Date.now()}`;

        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ServiceAccountAddRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        await flowService.executeAction(
            'index.yml',
            '.',
            {
                'keycloak.realm.role.create': {
                    credentials,
                    realmName: 'master',
                    role: {
                        name: realmRole1,
                    },
                },
            },
            context,
            {},
        );

        await flowService.executeAction(
            'index.yml',
            '.',
            {
                'keycloak.client.create': {
                    credentials,
                    realmName,
                    client: {
                        clientId,
                        enabled: true,
                    },
                },
            },
            context,
            {},
        );

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                'keycloak.client.service.account.mappings.roles.add': {
                    credentials,
                    realmName,
                    clientId,
                    roles: {
                        realm: [realmRole1],
                    },
                },
            },
            context,
            {},
        );

        assert(!snapshot.successful);
        const failedStep = snapshot.getSteps().find((s) => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '500',
            message: `ServiceAccount is not enabled for client with clientId "${clientId}" of realm "${realmName}"`,
        });
    }
}
