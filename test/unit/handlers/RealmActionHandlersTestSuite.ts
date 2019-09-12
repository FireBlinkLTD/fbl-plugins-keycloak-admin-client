import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    RealmCreateActionHandler,
    RealmDeleteActionHandler,
    RealmGetActionHandler,
    RealmUpdateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class RealmActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async crudOperations(): Promise<void> {
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmGetActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmUpdateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                '--': [
                    {
                        'keycloak.realm.create': {
                            credentials,
                            realm: {
                                realm: 'test',
                            },
                        },
                    },
                    {
                        'keycloak.realm.get': {
                            credentials,
                            realmName: 'test',
                            assignRealmTo: '$.ctx.afterCreate',
                        },
                    },
                    {
                        'keycloak.realm.update': {
                            credentials,
                            realmName: 'test',
                            realm: {
                                realm: 'test',
                                enabled: true,
                            },
                        },
                    },
                    {
                        'keycloak.realm.get': {
                            credentials,
                            realmName: 'test',
                            assignRealmTo: '$.ctx.afterUpdate',
                        },
                    },
                    {
                        'keycloak.realm.delete': {
                            credentials,
                            realmName: 'test',
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
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.realm.get': {
                    credentials,
                    realmName: 'test',
                    assignRealmTo: '$.ctx.afterDelete',
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
            message: `Unable to find realm with name: test`,
        });
    }
}
