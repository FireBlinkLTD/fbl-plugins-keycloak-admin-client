import { suite, test } from 'mocha-typescript';
import * as assert from 'assert';

import { UserCreateActionProcessor } from '../../../src/processors';

import credentials from '../credentials';
import { ContextUtil, ActionSnapshot } from 'fbl';

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

@suite()
export class BaseKeycloakAdminClientActionProcessor {
    @test()
    async makeRequestToWrongEndpoint(): Promise<void> {
        const processor = new UserCreateActionProcessor(
            {},
            ContextUtil.generateEmptyContext(),
            new ActionSnapshot('.', '.', {}, '.', 0, {}),
            {},
        );

        const client = await processor.getKeycloakAdminClient(credentials);

        let error;
        try {
            await processor.wrapKeycloakAdminRequest(async () => {
                await processor.get(client, '/invalid/enpoint');
            });
        } catch (err) {
            error = err;
        }

        assert(error);
        assert.strictEqual(error.message, 'Error: Request failed: 404 - Not Found');
        assert.strictEqual(error.code, '404');
    }
}
