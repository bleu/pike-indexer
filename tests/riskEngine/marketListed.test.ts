import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { Client } from 'pg';
import { describeIfSupported } from '../chains';
import { setupTest, TestSetup } from '../test-setup';
import { getTargetChainId } from '../utils';

describeIfSupported(
  getTargetChainId(),
  ['RiskEngineFromFactoryV1_MarketListed'],
  'RiskEngineFromFactoryV1 MarketListed Event Indexing',
  () => {
    let testSetup: TestSetup;
    let dbClient: Client;
    const chainId = parseInt(getTargetChainId());

    beforeAll(async () => {
      testSetup = await setupTest(chainId, [
        'RiskEngineFromFactoryV1_MarketListed',
      ]);

      dbClient = testSetup.dbClient;
    });

    afterAll(async () => {
      await testSetup.cleanup();
    });

    test('Should index MarketListed event', async () => {
      const result = await dbClient.query(
        `
          SELECT * FROM "pToken"
        `
      );

      expect(result.rows.length).toBe(0);
    });
  }
);
