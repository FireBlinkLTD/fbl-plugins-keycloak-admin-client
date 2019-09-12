import { ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    GroupCreateActionHandler,
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
    GroupAddClientRoleMappingsActionHandler,
    GroupApplyClientRoleMappingsActionHandler,
    GroupDeleteClientRoleMappingsActionHandler,
    GroupGetRoleMappingsActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class GroupClientRoleMappingsActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const clientId = `c-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupGetRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupAddClientRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupApplyClientRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupDeleteClientRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
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
                                name: 'a',
                            },
                        },
                    },
                    {
                        'keycloak.client.role.create': {
                            credentials,
                            realmName,
                            clientId,
                            role: {
                                name: 'b',
                            },
                        },
                    },
                    {
                        'keycloak.group.create': {
                            credentials,
                            realmName,
                            group: {
                                name: groupName,
                            },
                        },
                    },
                    {
                        'keycloak.group.mappings.client.roles.add': {
                            credentials,
                            realmName,
                            clientId,
                            groupName,
                            clientRoles: ['a'],
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

                    {
                        'keycloak.group.mappings.client.roles.apply': {
                            credentials,
                            realmName,
                            clientId,
                            groupName,
                            clientRoles: ['b'],
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

                    {
                        'keycloak.group.mappings.client.roles.delete': {
                            credentials,
                            realmName,
                            clientId,
                            groupName,
                            clientRoles: ['b'],
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
            realmRoles: [],
            clientRoles: {
                [clientId]: ['a'],
            },
        });

        assert.deepStrictEqual(context.ctx.afterApply, {
            realmRoles: [],
            clientRoles: {
                [clientId]: ['b'],
            },
        });

        assert.deepStrictEqual(context.ctx.afterDelete, {
            realmRoles: [],
            clientRoles: {},
        });
    }

    @test()
    async failToFindClient(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const clientId = `c-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupAddClientRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
                    {
                        'keycloak.group.create': {
                            credentials,
                            realmName,
                            group: {
                                name: groupName,
                            },
                        },
                    },
                    {
                        'keycloak.group.mappings.client.roles.add': {
                            credentials,
                            realmName,
                            clientId,
                            groupName,
                            clientRoles: ['a'],
                        },
                    },
                ],
            },
            context,
            {},
        );

        assert(!snapshot.successful);

        const failedChildSnapshot: ActionSnapshot = snapshot
            .getSteps()
            .find(s => s.type === 'child' && !s.payload.successful).payload;
        const failedStep = failedChildSnapshot.getSteps().find(s => s.type === 'failure');

        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find client "${clientId}" in realm "${realmName}".`,
        });
    }
}
