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
        assert.strictEqual(
            failedStep.payload,
            `Error: Unable to find role "${roleName}:new" of realm "master". Role not found`,
        );
    }
}
