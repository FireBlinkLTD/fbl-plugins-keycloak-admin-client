import { IDelegatedParameters, ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import {
    RealmCreateActionHandler,
    RealmDeleteActionHandler,
    RealmGetEventsConfigActionHandler,
    RealmUpdateEventsConfigActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class RealmEventsConfigActionHandlersTestSuite {
    after() {
        ActionHandlersRegistry.instance.cleanup();
    }

    @test()
    async getAndUpdate(): Promise<void> {
        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmGetEventsConfigActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmUpdateEventsConfigActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const snapshot = await flowService.executeAction(
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
                        'keycloak.realm.events.config.get': {
                            credentials,
                            realmName: 'test',
                            assignEventsConfigTo: '$.ctx.afterCreate',
                        },
                    },

                    {
                        'keycloak.realm.events.config.update': {
                            credentials,
                            realmName: 'test',
                            config: {
                                eventsEnabled: true,
                                eventsListeners: [],
                            },
                        },
                    },

                    {
                        'keycloak.realm.events.config.get': {
                            credentials,
                            realmName: 'test',
                            assignEventsConfigTo: '$.ctx.afterUpdate',
                        },
                    },

                    {
                        'keycloak.realm.events.config.update': {
                            credentials,
                            realmName: 'test',
                            config: {
                                eventsEnabled: true,
                                eventsListeners: ['jboss-logging'],
                            },
                        },
                    },

                    {
                        'keycloak.realm.events.config.get': {
                            credentials,
                            realmName: 'test',
                            assignEventsConfigTo: '$.ctx.afterUpdate2',
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
        assert.strictEqual(context.ctx.afterCreate.eventsEnabled, false);
        assert.deepStrictEqual(context.ctx.afterCreate.eventsListeners, ['jboss-logging']);

        assert.strictEqual(context.ctx.afterUpdate.eventsEnabled, true);
        assert.deepStrictEqual(context.ctx.afterUpdate.eventsListeners, []);

        assert.strictEqual(context.ctx.afterUpdate2.eventsEnabled, true);
        assert.deepStrictEqual(context.ctx.afterUpdate2.eventsListeners, ['jboss-logging']);
    }
}
