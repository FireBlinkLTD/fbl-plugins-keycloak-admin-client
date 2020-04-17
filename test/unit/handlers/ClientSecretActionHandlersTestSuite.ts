import { ContextUtil, ActionHandlersRegistry, FlowService, ActionSnapshot } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';

import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';
import { Container } from 'typedi';

import {
    ClientCreateActionHandler,
    ClientSecretGetActionHandler,
    ClientSecretGenerateActionHandler,
} from '../../../src/handlers';

import credentials from '../credentials';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../../');

@suite()
class ClientSecretsActionHandlersTestSuite {
    after() {
        Container.get(ActionHandlersRegistry).cleanup();
        Container.reset();
    }

    @test()
    async allOperations(): Promise<void> {
        const clientId = `c-${Date.now()}`;

        const actionHandlerRegistry = Container.get(ActionHandlersRegistry);
        const flowService = Container.get(FlowService);
        flowService.debug = true;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientSecretGenerateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientSecretGetActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        const realmName = 'master';
        const secret = '68521fbc-b91d-48c2-a185-c294cd9650b4';

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
                    {
                        'keycloak.client.create': {
                            credentials,
                            realmName,
                            client: {
                                clientId,
                                secret,
                                enabled: true,
                            },
                        },
                    },

                    {
                        'keycloak.client.secret.get': {
                            credentials,
                            realmName,
                            clientId,
                            assignClientSecretTo: '$.ctx.old.assign',
                            pushClientSecretTo: '$.ctx.old.push',
                        },
                    },

                    {
                        'keycloak.client.secret.generate': {
                            credentials,
                            realmName,
                            clientId,
                        },
                    },

                    {
                        'keycloak.client.secret.get': {
                            credentials,
                            realmName,
                            clientId,
                            assignClientSecretTo: '$.ctx.new.assign',
                        },
                    },
                ],
            },
            context,
            {},
        );

        assert(snapshot.successful);

        assert.strictEqual(context.ctx.old.assign, secret);
        assert.deepStrictEqual(context.ctx.old.push, [secret]);

        assert.notStrictEqual(context.ctx.new.assign, secret);
    }
}
