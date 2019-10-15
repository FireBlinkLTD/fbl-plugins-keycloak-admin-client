import { ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    UserCreateActionHandler,
    RealmRoleCreateActionHandler,
    UserAddRealmRoleMappingsActionHandler,
    UserApplyRealmRoleMappingsActionHandler,
    UserDeleteRealmRoleMappingsActionHandler,
    UserGetRoleMappingsActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class UserRealmRoleMappingsActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const role1 = `r-${Date.now()}`;
        const role2 = `${role1}-2`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserGetRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddRealmRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserApplyRealmRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserDeleteRealmRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName,
                            role: {
                                name: role1,
                            },
                        },
                    },
                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName,
                            role: {
                                name: role2,
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
                        'keycloak.user.mappings.realm.roles.add': {
                            credentials,
                            realmName,
                            username,
                            realmRoles: [role1],
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
                        'keycloak.user.mappings.realm.roles.apply': {
                            credentials,
                            realmName,
                            email,
                            realmRoles: [role2],
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
                        'keycloak.user.mappings.realm.roles.delete': {
                            credentials,
                            realmName,
                            email,
                            realmRoles: [role2],
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
        assert.deepStrictEqual(context.ctx.afterAdd, {
            realmRoles: ['offline_access', role1, 'uma_authorization'],
            clientRoles: {
                account: ['view-profile', 'manage-account'],
            },
        });

        assert.deepStrictEqual(context.ctx.afterApply, {
            realmRoles: [role2],
            clientRoles: {
                account: ['view-profile', 'manage-account'],
            },
        });

        assert.deepStrictEqual(context.ctx.afterDelete, {
            realmRoles: [],
            clientRoles: {
                account: ['view-profile', 'manage-account'],
            },
        });
    }

    @test()
    async unableToFindRealmRole(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;
        const role = `r-${Date.now()}`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddRealmRoleMappingsActionHandler(), plugin);

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
                        'keycloak.user.mappings.realm.roles.add': {
                            credentials,
                            realmName,
                            username,
                            realmRoles: [role],
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
            message: `Unable to find realm role "${role}" in realm "${realmName}".`,
        });
    }
}
