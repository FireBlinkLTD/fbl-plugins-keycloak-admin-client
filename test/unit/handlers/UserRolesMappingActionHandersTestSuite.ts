import { ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    UserCreateActionHandler,
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
    RealmRoleCreateActionHandler,
    UserGetRoleMappingsActionHandler,
    UserAddRoleMappingsActionHandler,
    UserApplyRoleMappingsActionHandler,
    UserDeleteRoleMappingsActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class UserRolesMappingsActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async allOperations(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;
        const clientId = `c-${Date.now()}`;
        const realmRole1 = `rr1-${Date.now()}`;
        const realmRole2 = `rr2-${Date.now()}`;
        const clientRole1 = `cr1-${Date.now()}`;
        const clientRole2 = `cr2-${Date.now()}`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserApplyRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserDeleteRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserGetRoleMappingsActionHandler(), plugin);

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

                    // create user
                    {
                        'keycloak.user.create': {
                            credentials,
                            realmName,
                            user: {
                                email,
                                username,
                                enabled: false,
                                firstName: 'test',
                            },
                        },
                    },

                    // add roles
                    {
                        'keycloak.user.mappings.roles.add': {
                            credentials,
                            realmName,
                            username,
                            roles: {
                                realm: [realmRole1],
                                client: {
                                    [clientId]: [clientRole1],
                                },
                            },
                        },
                    },
                    {
                        'keycloak.user.mappings.roles.get': {
                            credentials,
                            realmName,
                            email,
                            assignRoleMappingsTo: '$.ctx.afterAdd',
                        },
                    },

                    // apply roles
                    {
                        'keycloak.user.mappings.roles.apply': {
                            credentials,
                            realmName,
                            username,
                            roles: {
                                realm: [realmRole2],
                                client: {
                                    [clientId]: [clientRole2],
                                },
                            },
                        },
                    },

                    {
                        'keycloak.user.mappings.roles.get': {
                            credentials,
                            realmName,
                            username,
                            assignRoleMappingsTo: '$.ctx.afterApply',
                        },
                    },

                    // delete roles
                    {
                        'keycloak.user.mappings.roles.delete': {
                            credentials,
                            realmName,
                            username,
                            roles: {
                                realm: [realmRole2],
                                client: {
                                    [clientId]: [clientRole2],
                                },
                            },
                        },
                    },

                    {
                        'keycloak.user.mappings.roles.get': {
                            credentials,
                            realmName,
                            username,
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
        context.ctx.afterAdd.client.account.sort();
        assert.deepStrictEqual(context.ctx.afterAdd, {
            realm: ['offline_access', realmRole1, 'uma_authorization'],
            client: {
                account: ['manage-account', 'view-profile'],
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
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;
        const clientId = `c-${Date.now()}`;
        const realmRole1 = `rr1-${Date.now()}`;
        const realmRole2 = `rr2-${Date.now()}`;
        const clientRole1 = `cr1-${Date.now()}`;
        const clientRole2 = `cr2-${Date.now()}`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserApplyRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserDeleteRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserGetRoleMappingsActionHandler(), plugin);

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

                    // create user
                    {
                        'keycloak.user.create': {
                            credentials,
                            realmName,
                            user: {
                                email,
                                username,
                                enabled: false,
                                firstName: 'test',
                            },
                        },
                    },

                    // add roles
                    {
                        'keycloak.user.mappings.roles.add': {
                            credentials,
                            realmName,
                            username,
                            roles: {
                                realm: [realmRole1],
                                client: {
                                    [clientId]: [clientRole1],
                                },
                            },
                        },
                    },
                    {
                        'keycloak.user.mappings.roles.get': {
                            credentials,
                            realmName,
                            email,
                            assignRoleMappingsTo: '$.ctx.afterAdd',
                        },
                    },

                    // apply roles
                    {
                        'keycloak.user.mappings.roles.apply': {
                            credentials,
                            realmName,
                            username,
                            roles: {},
                        },
                    },

                    {
                        'keycloak.user.mappings.roles.get': {
                            credentials,
                            realmName,
                            username,
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
        context.ctx.afterAdd.client.account.sort();
        assert.deepStrictEqual(context.ctx.afterAdd, {
            realm: ['offline_access', realmRole1, 'uma_authorization'],
            client: {
                account: ['manage-account', 'view-profile'],
                [clientId]: [clientRole1],
            },
        });

        assert.deepStrictEqual(context.ctx.afterApply, {
            realm: [],
            client: {},
        });
    }
}
