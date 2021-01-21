import { ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import {
    GroupCreateActionHandler,
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
    RealmRoleCreateActionHandler,
    GroupGetRoleMappingsActionHandler,
    GroupAddRoleMappingsActionHandler,
    GroupApplyRoleMappingsActionHandler,
    GroupDeleteRoleMappingsActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class GroupRoleMappingsActionHandlersTestSuite {
    after() {
        ActionHandlersRegistry.instance.cleanup();
    }

    @test()
    async allOperations(): Promise<void> {
        const groupName = `g-${Date.now()}`;
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
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupAddRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupApplyRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupDeleteRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupGetRoleMappingsActionHandler(), plugin);

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

                    // create group
                    {
                        'keycloak.group.create': {
                            credentials,
                            realmName,
                            group: {
                                name: groupName,
                            },
                        },
                    },

                    // add roles
                    {
                        'keycloak.group.mappings.roles.add': {
                            credentials,
                            realmName,
                            groupName,
                            roles: {
                                realm: [realmRole1],
                                client: {
                                    [clientId]: [clientRole1],
                                },
                            },
                        },
                    },
                    {
                        'keycloak.group.mappings.roles.get': {
                            credentials,
                            realmName,
                            groupName,
                            assignRoleMappingsTo: '$.ctx.afterAdd',
                        },
                    },

                    // apply roles
                    {
                        'keycloak.group.mappings.roles.apply': {
                            credentials,
                            realmName,
                            groupName,
                            roles: {
                                realm: [realmRole2],
                                client: {
                                    [clientId]: [clientRole2],
                                },
                            },
                        },
                    },

                    {
                        'keycloak.group.mappings.roles.get': {
                            credentials,
                            realmName,
                            groupName,
                            assignRoleMappingsTo: '$.ctx.afterApply',
                        },
                    },

                    // delete roles
                    {
                        'keycloak.group.mappings.roles.delete': {
                            credentials,
                            realmName,
                            groupName,
                            roles: {
                                realm: [realmRole2],
                                client: {
                                    [clientId]: [clientRole2],
                                },
                            },
                        },
                    },

                    {
                        'keycloak.group.mappings.roles.get': {
                            credentials,
                            realmName,
                            groupName,
                            assignRoleMappingsTo: '$.ctx.afterDelete',
                        },
                    },
                ],
            },
            context,
            {},
        );

        assert(snapshot.successful);

        assert.deepStrictEqual(context.ctx.afterAdd, {
            realm: [realmRole1],
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
        const groupName = `g-${Date.now()}`;
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
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupAddRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupApplyRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupDeleteRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupGetRoleMappingsActionHandler(), plugin);

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

                    // create group
                    {
                        'keycloak.group.create': {
                            credentials,
                            realmName,
                            group: {
                                name: groupName,
                            },
                        },
                    },

                    // add roles
                    {
                        'keycloak.group.mappings.roles.add': {
                            credentials,
                            realmName,
                            groupName,
                            roles: {
                                realm: [realmRole1],
                                client: {
                                    [clientId]: [clientRole1],
                                },
                            },
                        },
                    },
                    {
                        'keycloak.group.mappings.roles.get': {
                            credentials,
                            realmName,
                            groupName,
                            assignRoleMappingsTo: '$.ctx.afterAdd',
                        },
                    },

                    // apply roles
                    {
                        'keycloak.group.mappings.roles.apply': {
                            credentials,
                            realmName,
                            groupName,
                            roles: {},
                        },
                    },

                    {
                        'keycloak.group.mappings.roles.get': {
                            credentials,
                            realmName,
                            groupName,
                            assignRoleMappingsTo: '$.ctx.afterApply',
                        },
                    },
                ],
            },
            context,
            {},
        );

        assert(snapshot.successful);

        assert.deepStrictEqual(context.ctx.afterAdd, {
            realm: [realmRole1],
            client: {
                [clientId]: [clientRole1],
            },
        });

        assert.deepStrictEqual(context.ctx.afterApply, {
            realm: [],
            client: {},
        });
    }
}
