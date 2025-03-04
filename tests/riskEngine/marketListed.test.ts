import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { Client } from 'pg';
import { setupTest, TestSetup } from '../test-setup';
import { describeIfSupported, getTargetChainId } from '../utils';

const targetEvents = ['RiskEngineFromFactoryV0_MarketListed'];

describeIfSupported(
  getTargetChainId(),
  targetEvents,
  'RiskEngineFromFactoryV0 MarketListed Event Indexing',
  () => {
    let testSetup: TestSetup;
    let dbClient: Client;
    const chainId = parseInt(getTargetChainId());

    beforeAll(async () => {
      testSetup = await setupTest(chainId, targetEvents);
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

      expect(result.rows.length).toBe(1);
    });
  }
);
