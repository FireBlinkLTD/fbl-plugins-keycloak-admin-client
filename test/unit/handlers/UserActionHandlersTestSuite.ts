import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    UserCreateActionHandler,
    UserDeleteActionHandler,
    UserGetActionHandler,
    UserUpdateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class UserActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new UserGetActionHandler(), plugin);
        actionHandlerRegistry.register(new UserUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                '--': [
                    {
                        'keycloak.user.create': {
                            credentials,
                            realmName: 'master',
                            user: {
                                email,
                                username,
                                enabled: false,
                                firstName: 'test',
                            },
                        },
                    },
                    {
                        'keycloak.user.get': {
                            credentials,
                            realmName: 'master',
                            username,
                            assignUserTo: '$.ctx.afterCreateByUsername',
                        },
                    },
                    {
                        'keycloak.user.get': {
                            credentials,
                            realmName: 'master',
                            email,
                            assignUserTo: '$.ctx.afterCreateByEmail',
                        },
                    },
                    {
                        'keycloak.user.update': {
                            credentials,
                            realmName: 'master',
                            username,
                            user: {
                                username,
                                email,
                                enabled: true,
                            },
                        },
                    },
                    {
                        'keycloak.user.get': {
                            credentials,
                            realmName: 'master',
                            username,
                            assignUserTo: '$.ctx.afterUpdate',
                        },
                    },
                    {
                        'keycloak.user.delete': {
                            credentials,
                            realmName: 'master',
                            username,
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
        assert.notStrictEqual(context.ctx.afterCreateByUsername.enabled, context.ctx.afterUpdate.enabled);
        assert.strictEqual(context.ctx.afterCreateByUsername.enabled, context.ctx.afterCreateByEmail.enabled);

        snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.user.get': {
                    credentials,
                    realmName: 'master',
                    username,
                    assignUserTo: '$.ctx.afterDelete',
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
            message: `Unable to find user "${username}" in realm "master"`,
        });
    }

    @test()
    async failToCreateSameUserTwice(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new UserGetActionHandler(), plugin);
        actionHandlerRegistry.register(new UserUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                '--': [
                    {
                        'keycloak.user.create': {
                            credentials,
                            realmName: 'master',
                            user: {
                                username,
                                email,
                                enabled: false,
                            },
                        },
                    },
                    {
                        'keycloak.user.get': {
                            credentials,
                            realmName: 'master',
                            username,
                            assignUserTo: '$.ctx.afterCreate',
                        },
                    },
                    {
                        'keycloak.user.create': {
                            credentials,
                            realmName: 'master',
                            user: {
                                username,
                                email,
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
            message: `Request failed with status code 409: User exists with same username`,
        });
    }

    @test()
    async failToUpdateMissingUser(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new UserUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.user.update': {
                    credentials,
                    realmName: 'master',
                    username,
                    user: {
                        username,
                        email,
                    },
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        let failedStep = snapshot.getSteps().find(s => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find user "${username}" in realm "master"`,
        });

        snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.user.update': {
                    credentials,
                    realmName: 'master',
                    email,
                    user: {
                        username,
                        email,
                    },
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        failedStep = snapshot.getSteps().find(s => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find user "${email}" in realm "master"`,
        });
    }

    @test()
    async failToGetMissingUser(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new UserGetActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        // delete by username
        let snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.user.get': {
                    credentials,
                    realmName: 'master',
                    username,
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        let failedStep = snapshot.getSteps().find(s => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find user "${username}" in realm "master"`,
        });

        // delete by email
        snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.user.get': {
                    credentials,
                    realmName: 'master',
                    email,
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        failedStep = snapshot.getSteps().find(s => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find user "${email}" in realm "master"`,
        });
    }

    @test()
    async failToDeleteMissingUser(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new UserDeleteActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        // delete by username
        let snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.user.delete': {
                    credentials,
                    realmName: 'master',
                    username,
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        let failedStep = snapshot.getSteps().find(s => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find user "${username}" in realm "master"`,
        });

        // delete by email
        snapshot = await flowService.executeAction(
            '.',
            // action id with options
            {
                'keycloak.user.delete': {
                    credentials,
                    realmName: 'master',
                    email,
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        assert(!snapshot.successful);
        failedStep = snapshot.getSteps().find(s => s.type === 'failure');
        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find user "${email}" in realm "master"`,
        });
    }
}
