import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    GroupCreateActionHandler,
    GroupDeleteActionHandler,
    GroupGetActionHandler,
    GroupUpdateActionHandler,
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class GroupActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupGetActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                '--': [
                    {
                        'keycloak.group.create': {
                            credentials,
                            realmName: 'master',
                            group: {
                                name: groupName,
                            },
                        },
                    },
                    {
                        'keycloak.group.get': {
                            credentials,
                            realmName: 'master',
                            groupName,
                            assignGroupTo: '$.ctx.afterCreate',
                        },
                    },
                    {
                        'keycloak.group.update': {
                            credentials,
                            realmName: 'master',
                            groupName,
                            group: {
                                name: groupName + '_new',
                            },
                        },
                    },
                    {
                        'keycloak.group.get': {
                            credentials,
                            realmName: 'master',
                            groupName: groupName + '_new',
                            assignGroupTo: '$.ctx.afterUpdate',
                        },
                    },
                    {
                        'keycloak.group.delete': {
                            credentials,
                            realmName: 'master',
                            groupName: groupName + '_new',
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
        assert.deepStrictEqual(context.ctx.afterCreate.name, groupName);
        assert.deepStrictEqual(context.ctx.afterUpdate.name, groupName + '_new');

        snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.group.get': {
                    credentials,
                    realmName: 'master',
                    groupName: groupName + '_new',
                    assignGroupTo: '$.ctx.afterDelete',
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
            message: `Unable to find group "${groupName}_new" in realm "master".`,
        });
    }

    @test()
    async failToCreateSameGroupTwice(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupGetActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                '--': [
                    {
                        'keycloak.group.create': {
                            credentials,
                            realmName: 'master',
                            group: {
                                name: groupName,
                            },
                        },
                    },
                    {
                        'keycloak.group.get': {
                            credentials,
                            realmName: 'master',
                            groupName,
                            assignGroupTo: '$.ctx.afterCreate',
                        },
                    },
                    {
                        'keycloak.group.create': {
                            credentials,
                            realmName: 'master',
                            group: {
                                name: groupName,
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
            message: `Request failed with status code 409: Top level group named '${groupName}' already exists.`,
        });
    }

    @test()
    async failToUpdateMissingGroup(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new GroupUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.group.update': {
                    credentials,
                    realmName: 'master',
                    groupName,
                    group: {
                        name: groupName,
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
            message: `Unable to find group "${groupName}" in realm "master".`,
        });
    }

    @test()
    async failToDeleteMissingGroup(): Promise<void> {
        const groupName = `g-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new GroupDeleteActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.group.delete': {
                    credentials,
                    realmName: 'master',
                    groupName,
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
            message: `Unable to find group "${groupName}" in realm "master".`,
        });
    }
}
