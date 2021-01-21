import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import credentials from './credentials';
import { ContextUtil, ActionHandlersRegistry, FlowService } from 'fbl';
import { SequenceFlowActionHandler } from 'fbl/dist/src/plugins/flow/SequenceFlowActionHandler';
import {
    RealmCreateActionHandler,
    RealmDeleteActionHandler,
    ClientCreateActionHandler,
    ClientRoleCreateActionHandler,
} from '../../src/handlers';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const plugin = require('../../');

@suite()
export class StressTestTestSuite {
    after() {
        ActionHandlersRegistry.instance.cleanup();
    }

    @test()
    async stressTest(): Promise<void> {
        const actionHandlerRegistry = ActionHandlersRegistry.instance;
        const flowService = FlowService.instance;

        actionHandlerRegistry.register(new SequenceFlowActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new RealmDeleteActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientCreateActionHandler(), plugin);
        actionHandlerRegistry.register(new ClientRoleCreateActionHandler(), plugin);

        const context = ContextUtil.generateEmptyContext();

        let i = 0;
        const generateActions = () => {
            i++;
            const realm = `stress_${i}`;

            return [
                {
                    'keycloak.realm.create': {
                        credentials,
                        realm: {
                            realm,
                        },
                    },
                },
                {
                    'keycloak.client.create': {
                        credentials,
                        realmName: realm,
                        client: {
                            clientId: 'stress',
                            enabled: false,
                        },
                    },
                },
                {
                    'keycloak.client.role.create': {
                        credentials,
                        realmName: realm,
                        clientId: 'stress',
                        role: {
                            name: 'test-1',
                        },
                    },
                },
                {
                    'keycloak.client.role.create': {
                        credentials,
                        realmName: realm,
                        clientId: 'stress',
                        role: {
                            name: 'test-2',
                        },
                    },
                },
                {
                    'keycloak.client.role.create': {
                        credentials,
                        realmName: realm,
                        clientId: 'stress',
                        role: {
                            name: 'test-3',
                        },
                    },
                },
                {
                    'keycloak.client.role.create': {
                        credentials,
                        realmName: realm,
                        clientId: 'stress',
                        role: {
                            name: 'test-4',
                        },
                    },
                },
                {
                    'keycloak.realm.delete': {
                        credentials,
                        realmName: realm,
                    },
                },
            ];
        };

        const snapshot = await flowService.executeAction(
            'index.yml',
            '.',
            {
                '--': [
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                    ...generateActions(),
                ],
            },
            context,
            {},
        );

        assert(snapshot.successful);
    }
}
