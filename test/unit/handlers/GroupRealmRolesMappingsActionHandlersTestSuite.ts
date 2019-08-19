import { ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    GroupCreateActionHandler,
    RealmRoleCreateActionHandler,
    GroupAddRealmRoleMappingsActionHandler,
    GroupApplyRealmRoleMappingsActionHandler,
    GroupDeleteRealmRoleMappingsActionHandler,
    GroupGetRoleMappingsActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class GroupRealmRoleMappingsActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const role1 = `r-${Date.now()}`;
        const role2 = `${role1}-2`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupGetRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupAddRealmRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupApplyRealmRoleMappingsActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupDeleteRealmRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
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
                        'keycloak.group.create': {
                            credentials,
                            realmName,
                            group: {
                                name: groupName,
                            },
                        },
                    },
                    {
                        'keycloak.group.mappings.realm.roles.add': {
                            credentials,
                            realmName,
                            groupName,
                            realmRoles: [role1],
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
                        'keycloak.group.mappings.realm.roles.apply': {
                            credentials,
                            realmName,
                            groupName,
                            realmRoles: [role2],
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
                        'keycloak.group.mappings.realm.roles.delete': {
                            credentials,
                            realmName,
                            groupName,
                            realmRoles: [role2],
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
            realmRoles: [role1],
            clientRoles: {},
        });

        assert.deepStrictEqual(context.ctx.afterApply, {
            realmRoles: [role2],
            clientRoles: {},
        });

        assert.deepStrictEqual(context.ctx.afterDelete, {
            realmRoles: [],
            clientRoles: {},
        });
    }

    @test()
    async unableToFindRealmRole(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const role = `r-${Date.now()}`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupAddRealmRoleMappingsActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';

        const snapshot = await flowService.executeAction(
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
                        'keycloak.group.mappings.realm.roles.add': {
                            credentials,
                            realmName,
                            groupName,
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
