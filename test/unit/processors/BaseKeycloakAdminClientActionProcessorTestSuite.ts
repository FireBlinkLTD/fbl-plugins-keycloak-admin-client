import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import { BaseKeycloakAdminClientActionProcessor } from '../../../src/processors';

import credentials from '../credentials';
import { ContextUtil, ActionSnapshot } from 'fbl';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

class DummyProcessor extends BaseKeycloakAdminClientActionProcessor {
    public fn!: Function;

    async process(): Promise<void> {
        await this.fn();
    }
}

@suite()
export class BaseKeycloakAdminClientActionProcessorTestSuite {
    @test()
    async unableToFindRealmRole(): Promise<void> {
        const processor = new DummyProcessor(
            {},
            ContextUtil.generateEmptyContext(),
            new ActionSnapshot('.', '.', {}, '.', 0, {}),
            {},
        );

        const roleName = `missing-${Date.now()}`;
        const realmName = 'master';

        processor.fn = async () => {
            const client = await processor.getKeycloakAdminClient(credentials);
            await processor.getRealmRoles(client, [roleName], realmName);
        };

        let error;
        try {
            await processor.execute();
        } catch (err) {
            error = err;
        }

        assert(error);
        assert.strictEqual(error.message, `Unable to find realm role "${roleName}" in realm "${realmName}".`);
        assert.strictEqual(error.code, '404');
    }
}
