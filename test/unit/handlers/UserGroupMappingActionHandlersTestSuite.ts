import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    UserCreateActionHandler,
    UserAddToGroupActionHandler,
    GroupCreateActionHandler,
    UserGetGroupsActionHandler,
    UserDeleteFromGroupActionHandler,
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
    async mapping(): Promise<void> {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const groupName = `g${Date.now()}`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new GroupCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddToGroupActionHandler(), plugin);
        actionHandlerRegistry.register(new UserGetGroupsActionHandler(), plugin);
        actionHandlerRegistry.register(new UserDeleteFromGroupActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            'index.yml',
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
                            },
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
                    {
                        'keycloak.user.groups.add': {
                            credentials,
                            realmName: 'master',
                            email,
                            groupName,
                        },
                    },
                    {
                        'keycloak.user.groups.get': {
                            credentials,
                            realmName: 'master',
                            email,
                            assignGroupsTo: '$.ctx.afterAssignment',
                        },
                    },
                    {
                        'keycloak.user.groups.delete': {
                            credentials,
                            realmName: 'master',
                            username,
                            groupName,
                        },
                    },
                    {
                        'keycloak.user.groups.get': {
                            credentials,
                            realmName: 'master',
                            email,
                            assignGroupsTo: '$.ctx.afterUnassignment',
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
        assert.deepStrictEqual(context.ctx.afterAssignment, [groupName]);
        assert.deepStrictEqual(context.ctx.afterUnassignment, []);
    }

    @test()
    async failOnMissingGroup() {
        const username = `u${Date.now()}`;
        const email = `${username}@fireblink.com`;

        const groupName = `g${Date.now()}`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new UserCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new UserAddToGroupActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
            'index.yml',
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
                            },
                        },
                    },
                    {
                        'keycloak.user.groups.add': {
                            credentials,
                            realmName: 'master',
                            email,
                            groupName,
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

        const failedChildSnapshot: ActionSnapshot = snapshot
            .getSteps()
            .find(s => s.type === 'child' && !s.payload.successful).payload;
        const failedStep = failedChildSnapshot.getSteps().find(s => s.type === 'failure');

        assert.deepStrictEqual(failedStep.payload, {
            code: '404',
            message: `Unable to find group "${groupName}" in realm "master".`,
        });
    }
}
