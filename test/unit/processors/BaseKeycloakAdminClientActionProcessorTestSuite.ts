import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import credentials from '../credentials';
import { ContextUtil, ActionSnapshot } from 'fbl';
import { BaseActionProcessor } from '../../../src/processors/base';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

class DummyProcessor extends BaseActionProcessor {
    public fn!: Function;

    async execute(): Promise<void> {
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
        assert.strictEqual(error.message, `Request failed with status code 404`);
        assert.strictEqual(error.code, '404');
    }
}
