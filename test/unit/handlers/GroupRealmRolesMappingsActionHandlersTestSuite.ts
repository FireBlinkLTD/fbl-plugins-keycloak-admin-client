import { ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
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
}

//     @test()
//     async crudOperations(): Promise<void> {
//         const groupName = `g-${Date.now()}`;
//         const clientId = `c-${Date.now()}`;
//         const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
//         const flowService = Container.get(FlowService);
//         flowService.debug = true;

//         actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
//         actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
//         actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupGetActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

//         const context = ContextUtil.generateEmptyContext();

//         let snapshot = await flowService.executeAction(
//             '.',
//             // action id with options
//             {
//                 '--': [
//                     {
//                         'keycloak.client.create': {
//                             credentials,
//                             realmName: 'master',
//                             client: {
//                                 clientId,
//                                 enabled: true,
//                             },
//                         },
//                     },
//                     {
//                         'keycloak.client.role.create': {
//                             credentials,
//                             realmName: 'master',
//                             clientId,
//                             role: {
//                                 name: 'a',
//                             },
//                         },
//                     },
//                     {
//                         'keycloak.client.role.create': {
//                             credentials,
//                             realmName: 'master',
//                             clientId,
//                             role: {
//                                 name: 'b',
//                             },
//                         },
//                     },
//                     {
//                         'keycloak.group.create': {
//                             credentials,
//                             realmName: 'master',
//                             group: {
//                                 name: groupName,
//                                 realmRoles: ['admin'],
//                                 clientRoles: {
//                                     [clientId]: ['a'],
//                                 },
//                             },
//                         },
//                     },
//                     {
//                         'keycloak.group.get': {
//                             credentials,
//                             realmName: 'master',
//                             groupName,
//                             assignGroupTo: '$.ctx.afterCreate',
//                         },
//                     },
//                     {
//                         'keycloak.group.update': {
//                             credentials,
//                             realmName: 'master',
//                             groupName,
//                             group: {
//                                 name: groupName,
//                                 realmRoles: ['create-realm'],
//                                 clientRoles: {
//                                     [clientId]: ['b'],
//                                 },
//                             },
//                         },
//                     },
//                     {
//                         'keycloak.group.get': {
//                             credentials,
//                             realmName: 'master',
//                             groupName,
//                             assignGroupTo: '$.ctx.afterUpdate',
//                         },
//                     },
//                     {
//                         'keycloak.group.delete': {
//                             credentials,
//                             realmName: 'master',
//                             groupName,
//                         },
//                     },
//                 ],
//             },
//             // shared context
//             context,
//             // delegated parameters
//             <IDelegatedParameters>{},
//         );

//         assert(snapshot.successful);
//         assert.deepStrictEqual(context.ctx.afterCreate.realmRoles, ['admin']);
//         assert.deepStrictEqual(context.ctx.afterCreate.clientRoles, {
//             [clientId]: ['a'],
//         });

//         assert.deepStrictEqual(context.ctx.afterUpdate.realmRoles, ['create-realm']);
//         assert.deepStrictEqual(context.ctx.afterUpdate.clientRoles, {
//             [clientId]: ['b'],
//         });

//         snapshot = await flowService.executeAction(
//             '.',
//             // action id with options
//             {
//                 'keycloak.group.get': {
//                     credentials,
//                     realmName: 'master',
//                     groupName,
//                     assignGroupTo: '$.ctx.afterDelete',
//                 },
//             },
//             // shared context
//             context,
//             // delegated parameters
//             <IDelegatedParameters>{},
//         );

//         assert(!snapshot.successful);
//         const failedStep = snapshot.getSteps().find(s => s.type === 'failure');
//         assert.deepStrictEqual(failedStep.payload, {
//             code: '404',
//             message: `Unable to find group "${groupName}" in realm "master".`,
//         });
//     }

//     @test()
//     async failToCreateSameGroupTwice(): Promise<void> {
//         const groupName = `g-${Date.now()}`;
//         const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
//         const flowService = Container.get(FlowService);
//         flowService.debug = true;

//         actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupGetActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

//         const context = ContextUtil.generateEmptyContext();

//         const snapshot = await flowService.executeAction(
//             '.',
//             // action id with options
//             {
//                 '--': [
//                     {
//                         'keycloak.group.create': {
//                             credentials,
//                             realmName: 'master',
//                             group: {
//                                 name: groupName,
//                             },
//                         },
//                     },
//                     {
//                         'keycloak.group.get': {
//                             credentials,
//                             realmName: 'master',
//                             groupName,
//                             assignGroupTo: '$.ctx.afterCreate',
//                         },
//                     },
//                     {
//                         'keycloak.group.create': {
//                             credentials,
//                             realmName: 'master',
//                             group: {
//                                 name: groupName,
//                             },
//                         },
//                     },
//                 ],
//             },
//             // shared context
//             context,
//             // delegated parameters
//             <IDelegatedParameters>{},
//         );

//         assert(!snapshot.successful);
//         assert(context.ctx.afterCreate);
//         const failedChildSnapshot: ActionSnapshot = snapshot
//             .getSteps()
//             .find(s => s.type === 'child' && !s.payload.successful).payload;
//         const failedStep = failedChildSnapshot.getSteps().find(s => s.type === 'failure');

//         assert.deepStrictEqual(failedStep.payload, {
//             code: '409',
//             message: `Request failed with status code 409: Top level group named '${groupName}' already exists.`,
//         });
//     }

//     @test()
//     async failToUpdateMissingGroup(): Promise<void> {
//         const groupName = `g-${Date.now()}`;
//         const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
//         const flowService = Container.get(FlowService);
//         flowService.debug = true;

//         actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

//         const context = ContextUtil.generateEmptyContext();

//         const snapshot = await flowService.executeAction(
//             '.',
//             // action id with options
//             {
//                 'keycloak.group.update': {
//                     credentials,
//                     realmName: 'master',
//                     groupName,
//                     group: {
//                         name: groupName,
//                     },
//                 },
//             },
//             // shared context
//             context,
//             // delegated parameters
//             <IDelegatedParameters>{},
//         );

//         assert(!snapshot.successful);
//         const failedStep = snapshot.getSteps().find(s => s.type === 'failure');
//         assert.deepStrictEqual(failedStep.payload, {
//             code: '404',
//             message: `Unable to find group "${groupName}" in realm "master".`,
//         });
//     }

//     @test()
//     async failToDeleteMissingGroup(): Promise<void> {
//         const groupName = `g-${Date.now()}`;
//         const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
//         const flowService = Container.get(FlowService);
//         flowService.debug = true;

//         actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);

//         const context = ContextUtil.generateEmptyContext();

//         const snapshot = await flowService.executeAction(
//             '.',
//             // action id with options
//             {
//                 'keycloak.group.delete': {
//                     credentials,
//                     realmName: 'master',
//                     groupName,
//                 },
//             },
//             // shared context
//             context,
//             // delegated parameters
//             <IDelegatedParameters>{},
//         );

//         assert(!snapshot.successful);
//         const failedStep = snapshot.getSteps().find(s => s.type === 'failure');
//         assert.deepStrictEqual(failedStep.payload, {
//             code: '404',
//             message: `Unable to find group "${groupName}" in realm "master".`,
//         });
//     }

//     @test()
//     async failToAddMissingRealmRole(): Promise<void> {
//         const groupName = `g-${Date.now()}`;
//         const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
//         const flowService = Container.get(FlowService);
//         flowService.debug = true;

//         actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupGetActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

//         const context = ContextUtil.generateEmptyContext();

//         const snapshot = await flowService.executeAction(
//             '.',
//             // action id with options
//             {
//                 '--': [
//                     {
//                         'keycloak.group.create': {
//                             credentials,
//                             realmName: 'master',
//                             group: {
//                                 name: groupName,
//                                 realmRoles: ['foo'],
//                             },
//                         },
//                     },
//                 ],
//             },
//             // shared context
//             context,
//             // delegated parameters
//             <IDelegatedParameters>{},
//         );

//         assert(!snapshot.successful);

//         const failedChildSnapshot: ActionSnapshot = snapshot
//             .getSteps()
//             .find(s => s.type === 'child' && !s.payload.successful).payload;
//         const failedStep = failedChildSnapshot.getSteps().find(s => s.type === 'failure');

//         assert.deepStrictEqual(failedStep.payload, {
//             code: '404',
//             message: 'Unable to find realm role "foo" in realm "master".',
//         });
//     }

//     @test()
//     async failToAddClientRoleMissingClient(): Promise<void> {
//         const groupName = `g-${Date.now()}`;
//         const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
//         const flowService = Container.get(FlowService);
//         flowService.debug = true;

//         actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupGetActionHandler(), plugin);
//         actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

//         const context = ContextUtil.generateEmptyContext();

//         const snapshot = await flowService.executeAction(
//             '.',
//             // action id with options
//             {
//                 '--': [
//                     {
//                         'keycloak.group.create': {
//                             credentials,
//                             realmName: 'master',
//                             group: {
//                                 name: groupName,
//                                 clientRoles: {
//                                     foo: ['bar'],
//                                 },
//                             },
//                         },
//                     },
//                 ],
//             },
//             // shared context
//             context,
//             // delegated parameters
//             <IDelegatedParameters>{},
//         );

//         assert(!snapshot.successful);

//         const failedChildSnapshot: ActionSnapshot = snapshot
//             .getSteps()
//             .find(s => s.type === 'child' && !s.payload.successful).payload;
//         const failedStep = failedChildSnapshot.getSteps().find(s => s.type === 'failure');

//         assert.deepStrictEqual(failedStep.payload, {
//             code: '404',
//             message: 'Unable to find client "foo" in realm "master".',
//         });
//     }
// }
