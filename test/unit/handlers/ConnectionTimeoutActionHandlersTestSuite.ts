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
class ConnectionTimeoutActionHandlersTestSuite {
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
        const credentialsWithTimeout = {
            ...credentials,
            requestConfig: {
                timeout: 1,
            },
        };
        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            // action id with options
            {
                'keycloak.realm.create': {
                    credentials: credentialsWithTimeout,
                    realm: {
                        realm: 'test',
                    },
                },
            },
            // shared context
            context,
            // delegated parameters
            <IDelegatedParameters>{},
        );

        console.log(JSON.stringify(snapshot, null, 4));
        assert(!snapshot.successful);
        assert.strictEqual(snapshot.steps.find(s => s.type === 'failure').payload.message, 'ETIMEDOUT');
    }
}
