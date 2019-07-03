import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';
import { ActionHandlersRegistry, FlowService, ContextUtil, IDelegatedParameters } from 'fbl';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

import credentials from '../credentials';
import { ClientDeleteActionHandler } from '../../../src/handlers';

const plugin = require('../../../');

@suite()
export class ClientDeleteActionHandlerTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async failToDeleteMissingClient(): Promise<void> {
        const clientId = `t-${Date.now()}`;
        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);

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
    }
}
