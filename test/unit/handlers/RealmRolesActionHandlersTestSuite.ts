import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    RealmRoleCreateActionHandler,
    RealmRoleDeleteActionHandler,
    RealmRoleGetActionHandler,
    RealmRoleUpdateActionHandler,
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class RealmRolesActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const roleName = `r-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                '--': [
                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: roleName,
                            },
                        },
                    },
                    {
                        'keycloak.realm.role.get': {
                            credentials,
                            realmName: 'master',
                            roleName: roleName,
                            assignRoleTo: '$.ctx.afterCreate',
                        },
                    },
                    {
                        'keycloak.realm.role.update': {
                            credentials,
                            realmName: 'master',
                            roleName: roleName,
                            role: {
                                name: `${roleName}:new`,
                            },
                        },
                    },
                    {
                        'keycloak.realm.role.get': {
                            credentials,
                            realmName: 'master',
                            roleName: `${roleName}:new`,
                            assignRoleTo: '$.ctx.afterUpdate',
                        },
                    },
                    {
                        'keycloak.realm.role.delete': {
                            credentials,
                            realmName: 'master',
                            roleName: `${roleName}:new`,
                        },
                    },
                ],
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(snapshot.successful);
        assert.strictEqual(context.ctx.afterCreate.name, roleName);
        assert.strictEqual(context.ctx.afterUpdate.name, `${roleName}:new`);

        snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.realm.role.get': {
                    credentials,
                    realmName: 'master',
                    roleName: `${roleName}:new`,
                    assignRoleTo: '$.ctx.afterDelete',
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        const failedStep = snapshot.getSteps().find(s => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Request failed with status code 404`,
        });
    }

    @test()
    async compositeRole(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const role1Name = `r1-${Date.now()}`;
        const role2Name = `r2-${Date.now()}`;
        const cr1Name = `cr1-${Date.now()}`;
        const cr2Name = `cr2-${Date.now()}`;
        const compositeRoleName = `rc-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                '--': [
                    {
                        'keycloak.client.create': {
                            credentials,
                            realmName: 'master',
                            client: {
                                clientId,
                                enabled: false,
                            },
                        },
                    },

                    {
                        'keycloak.client.role.create': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: cr1Name,
                            },
                        },
                    },

                    {
                        'keycloak.client.role.create': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: cr2Name,
                            },
                        },
                    },

                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: role1Name,
                            },
                        },
                    },

                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: role2Name,
                            },
                        },
                    },

                    {
                        'keycloak.realm.role.create': {
                            credentials,
                            realmName: 'master',
                            role: {
                                name: compositeRoleName,
                                composite: true,
                                composites: {
                                    realm: [role1Name],
                                    client: {
                                        [clientId]: [cr1Name],
                                    },
                                },
                            },
                        },
                    },

                    {
                        'keycloak.realm.role.get': {
                            credentials,
                            realmName: 'master',
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterCreate',
                        },
                    },

                    {
                        'keycloak.realm.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            role: {
                                name: compositeRoleName,
                                composite: true,
                                composites: {
                                    realm: [role2Name],
                                    client: {
                                        [clientId]: [cr2Name],
                                    },
                                },
                            },
                        },
                    },

                    {
                        'keycloak.realm.role.get': {
                            credentials,
                            realmName: 'master',
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterUpdate',
                        },
                    },

                    {
                        'keycloak.realm.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            role: {
                                name: compositeRoleName,
                            },
                        },
                    },

                    {
                        'keycloak.realm.role.get': {
                            credentials,
                            realmName: 'master',
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterDelete',
                        },
                    },
                ],
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(snapshot.successful);

        assert.strictEqual(context.ctx.afterCreate.name, compositeRoleName);
        assert.strictEqual(context.ctx.afterCreate.composite, true);

        assert.deepStrictEqual(context.ctx.afterCreate.composites, {
            realm: [role1Name],
            client: {
                [clientId]: [cr1Name],
            },
        });

        assert.strictEqual(context.ctx.afterUpdate.name, compositeRoleName);
        assert.strictEqual(context.ctx.afterUpdate.composite, true);

        assert.deepStrictEqual(context.ctx.afterUpdate.composites, {
            realm: [role2Name],
            client: {
                [clientId]: [cr2Name],
            },
        });

        assert.strictEqual(context.ctx.afterDelete.name, compositeRoleName);
        assert.strictEqual(context.ctx.afterDelete.composite, false);
        assert(!context.ctx.afterDelete.composites);
    }
}
