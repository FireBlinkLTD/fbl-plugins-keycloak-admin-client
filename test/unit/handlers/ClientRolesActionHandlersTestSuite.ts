import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
    ClientRoleDeleteActionHandler,
    ClientRoleGetActionHandler,
    ClientRoleUpdateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class ClientRolesActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleGetActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleUpdateActionHandler(), plugin);

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
            '.',
            // action id with options
            {
                'keycloak.client.roole:get': {
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
    }
}
