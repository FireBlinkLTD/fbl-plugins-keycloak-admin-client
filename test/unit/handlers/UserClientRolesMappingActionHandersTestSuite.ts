import { ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    UserCreateActionHandler,
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
    UserAddClientRoleMappingsActionHandler,
    UserApplyClientRoleMappingsActionHandler,
    UserDeleteClientRoleMappingsActionHandler,
    UserGetRoleMappingsActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class UserClientRoleMappingsActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;
        const clientId = `c-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserGetRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddClientRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserApplyClientRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserDeleteClientRoleMappingsActionHandler(), plugin);

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
                    {
                        'keycloak.user.mappings.client.roles.add': {
                            credentials,
                            realmName,
                            clientId,
                            username,
                            clientRoles: ['a'],
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

                    {
                        'keycloak.user.mappings.client.roles.apply': {
                            credentials,
                            realmName,
                            clientId,
                            username,
                            clientRoles: ['b'],
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

                    {
                        'keycloak.user.mappings.client.roles.delete': {
                            credentials,
                            realmName,
                            clientId,
                            username,
                            clientRoles: ['b'],
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

        context.ctx.afterAdd.realmRoles.sort();
        context.ctx.afterAdd.clientRoles.account.sort();
        assert.deepStrictEqual(context.ctx.afterAdd, {
            realmRoles: ['offline_access', 'uma_authorization'],
            clientRoles: {
                account: ['manage-account', 'view-profile'],
                [clientId]: ['a'],
            },
        });

        context.ctx.afterApply.realmRoles.sort();
        context.ctx.afterApply.clientRoles.account.sort();
        assert.deepStrictEqual(context.ctx.afterApply, {
            realmRoles: ['offline_access', 'uma_authorization'],
            clientRoles: {
                account: ['manage-account', 'view-profile'],
                [clientId]: ['b'],
            },
        });

        context.ctx.afterDelete.realmRoles.sort();
        context.ctx.afterDelete.clientRoles.account.sort();
        assert.deepStrictEqual(context.ctx.afterDelete, {
            realmRoles: ['offline_access', 'uma_authorization'],
            clientRoles: {
                account: ['manage-account', 'view-profile'],
            },
        });
    }

    @test()
    async failToFindClient(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;
        const clientId = `c-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddClientRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
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
                    {
                        'keycloak.user.mappings.client.roles.add': {
                            credentials,
                            realmName,
                            clientId,
                            username,
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
            message: `Client with clientId "${clientId}" of realm "${realmName}" not found`,
        });
    }
}
