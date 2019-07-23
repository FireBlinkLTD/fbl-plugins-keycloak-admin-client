import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    ClientCreateActionHandler,
    ClientDeleteActionHandler,
    ClientGetActionHandler,
    ClientUpdateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class ClientActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
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
                        'keycloak.client.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            assignClientTo: '$.ctx.afterCreate',
                        },
                    },
                    {
                        'keycloak.client.update': {
                            credentials,
                            realmName: 'master',
                            client: {
                                clientId,
                                enabled: true,
                            },
                        },
                    },
                    {
                        'keycloak.client.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            assignClientTo: '$.ctx.afterUpdate',
                        },
                    },
                    {
                        'keycloak.client.delete': {
                            credentials,
                            realmName: 'master',
                            clientId,
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
        assert.notStrictEqual(context.ctx.afterCreate.enabled, context.ctx.afterUpdate.enabled);

        snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.client.get': {
                    credentials,
                    realmName: 'master',
                    clientId,
                    assignClientTo: '$.ctx.afterDelete',
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
            message: `Unable to find client with clientId: ${clientId} of realm "master".`,
        });
    }

    @test()
    async failToCreateSameClientTwice(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
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
                        'keycloak.client.get': {
                            credentials,
                            realmName: 'master',
                            clientId,
                            assignClientTo: '$.ctx.afterCreate',
                        },
                    },
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
                ],
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        assert(context.ctx.afterCreate);
        const failedChildSnapshot: ActionSnapshot = snapshot
            .getSteps()
            .find(s => s.type === 'child' && !s.payload.successful).payload;
        const failedStep = failedChildSnapshot.getSteps().find(s => s.type === 'failure');

        assert.deepStrictEqual(failedStep.payload, {
            code: '409',
            message: `Request failed with status code 409: Client ${clientId} already exists`,
        });
    }

    @test()
    async failToUpdateMissingClient(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new ClientUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.client.update': {
                    credentials,
                    realmName: 'master',
                    client: {
                        clientId,
                    },
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
            message: `Unable to update client with clientId: ${clientId} of realm "master". Client not found`,
        });
    }

    @test()
    async failToDeleteMissingClient(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new ClientDeleteActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.client.delete': {
                    credentials,
                    realmName: 'master',
                    clientId,
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
            message: `Unable to delete client with clientId: ${clientId} of realm "master". Client not found`,
        });
    }
}
