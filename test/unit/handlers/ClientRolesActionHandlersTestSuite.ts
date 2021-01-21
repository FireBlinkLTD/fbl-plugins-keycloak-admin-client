import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import {
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
    ClientRoleDeleteActionHandler,
    ClientRoleGetActionHandler,
    ClientRoleUpdateActionHandler,
    RealmRoleCreateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class ClientRolesActionHandlersTestSuite {
    after() {
        ActionHandlersRegistry.instance.cleanup();
    }

    @test()
    async crudOperations(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
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
                                name: 'test',
                            },
                        },
                    },
                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: 'test',
                            assignRoleTo: '$.ctx.afterCreate',
                        },
                    },
                    {
                        'keycloak.client.role.update': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: 'test',
                            role: {
                                name: 'test:new',
                            },
                        },
                    },
                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: 'test:new',
                            assignRoleTo: '$.ctx.afterUpdate',
                        },
                    },
                    {
                        'keycloak.client.role.delete': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: 'test:new',
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
        assert.strictEqual(context.ctx.afterCreate.name, 'test');
        assert.strictEqual(context.ctx.afterUpdate.name, 'test:new');

        snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.client.role.get': {
                    credentials,
                    realmName: 'master',
                    clientId,
                    roleName: 'test:new',
                    assignRoleTo: '$.ctx.afterDelete',
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        const failedStep = snapshot.getSteps().find((s) => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: 'Request failed with status code 404',
        });
    }

    @test()
    async failForMissingClient(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.client.role.create': {
                    credentials,
                    realmName: 'master',
                    clientId,
                    role: {
                        name: 'test',
                    },
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        let failedStep = snapshot.getSteps().find((s) => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Client with clientId "${clientId}" of realm "master" not found`,
        });

        snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.client.role.delete': {
                    credentials,
                    realmName: 'master',
                    clientId,
                    roleName: 'test',
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        failedStep = snapshot.getSteps().find((s) => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Client with clientId "${clientId}" of realm "master" not found`,
        });

        snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.client.role.get': {
                    credentials,
                    realmName: 'master',
                    clientId,
                    roleName: 'test',
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        failedStep = snapshot.getSteps().find((s) => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Client with clientId "${clientId}" of realm "master" not found`,
        });

        snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.client.role.update': {
                    credentials,
                    realmName: 'master',
                    clientId,
                    roleName: 'test',
                    role: {
                        name: 'test:new',
                    },
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        failedStep = snapshot.getSteps().find((s) => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Client with clientId "${clientId}" of realm "master" not found`,
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
        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleUpdateActionHandler(), plugin);

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
                        'keycloak.client.role.create': {
                            credentials,
                            realmName: 'master',
                            clientId,
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
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterCreate',
                        },
                    },

                    {
                        'keycloak.client.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            clientId,
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
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterUpdate',
                        },
                    },

                    {
                        'keycloak.client.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: compositeRoleName,
                            },
                        },
                    },

                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            roleName: compositeRoleName,
                            clientId,
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

    @test()
    async compositeRole2(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const role1Name = `r1-${Date.now()}`;
        const role2Name = `r2-${Date.now()}`;
        const cr1Name = `cr1-${Date.now()}`;
        const cr2Name = `cr2-${Date.now()}`;
        const compositeRoleName = `rc-${Date.now()}`;
        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleUpdateActionHandler(), plugin);

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
                        'keycloak.client.role.create': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: compositeRoleName,
                                composite: true,
                                composites: {
                                    realm: [role1Name, role2Name],
                                    client: {},
                                },
                            },
                        },
                    },

                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterCreate',
                        },
                    },

                    {
                        'keycloak.client.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: compositeRoleName,
                                composite: true,
                                composites: {
                                    realm: [],
                                    client: {
                                        [clientId]: [cr1Name, cr2Name],
                                    },
                                },
                            },
                        },
                    },

                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterUpdate',
                        },
                    },

                    {
                        'keycloak.client.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: compositeRoleName,
                            },
                        },
                    },

                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            roleName: compositeRoleName,
                            clientId,
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

        context.ctx.afterCreate.composites.realm.sort();
        assert.deepStrictEqual(context.ctx.afterCreate.composites, {
            realm: [role1Name, role2Name],
            client: {},
        });

        assert.strictEqual(context.ctx.afterUpdate.name, compositeRoleName);
        assert.strictEqual(context.ctx.afterUpdate.composite, true);

        context.ctx.afterUpdate.composites.client[clientId].sort();
        assert.deepStrictEqual(context.ctx.afterUpdate.composites, {
            realm: [],
            client: {
                [clientId]: [cr1Name, cr2Name],
            },
        });

        assert.strictEqual(context.ctx.afterDelete.name, compositeRoleName);
        assert.strictEqual(context.ctx.afterDelete.composite, false);
        assert(!context.ctx.afterDelete.composites);
    }

    @test()
    async compositeRole3(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const role1Name = `r1-${Date.now()}`;
        const role2Name = `r2-${Date.now()}`;
        const cr1Name = `cr1-${Date.now()}`;
        const cr2Name = `cr2-${Date.now()}`;
        const compositeRoleName = `rc-${Date.now()}`;
        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleUpdateActionHandler(), plugin);

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
                        'keycloak.client.role.create': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: compositeRoleName,
                            },
                        },
                    },

                    {
                        'keycloak.client.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: compositeRoleName,
                                composite: true,
                                composites: {
                                    realm: [role1Name, role2Name],
                                    client: {
                                        [clientId]: [cr1Name, cr2Name],
                                    },
                                },
                            },
                        },
                    },

                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterUpdate',
                        },
                    },

                    {
                        'keycloak.client.role.update': {
                            credentials,
                            roleName: compositeRoleName,
                            realmName: 'master',
                            clientId,
                            role: {
                                name: compositeRoleName,
                                composite: true,
                                composites: {
                                    realm: [role1Name, role2Name],
                                    client: {},
                                },
                            },
                        },
                    },

                    {
                        'keycloak.client.role.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            roleName: compositeRoleName,
                            assignRoleTo: '$.ctx.afterUpdate2',
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

        assert.strictEqual(context.ctx.afterUpdate.name, compositeRoleName);
        assert.strictEqual(context.ctx.afterUpdate.composite, true);

        context.ctx.afterUpdate.composites.realm.sort();
        context.ctx.afterUpdate.composites.client[clientId].sort();
        assert.deepStrictEqual(context.ctx.afterUpdate.composites, {
            realm: [role1Name, role2Name],
            client: {
                [clientId]: [cr1Name, cr2Name],
            },
        });

        assert.strictEqual(context.ctx.afterUpdate2.name, compositeRoleName);
        assert.strictEqual(context.ctx.afterUpdate2.composite, true);

        context.ctx.afterUpdate2.composites.realm.sort();
        assert.deepStrictEqual(context.ctx.afterUpdate2.composites, {
            realm: [role1Name, role2Name],
            client: {},
        });
    }
}
