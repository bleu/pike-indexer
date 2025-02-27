import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { Client } from 'pg';
import { describeIfSupported } from '../chains';
import { setupTest, TestSetup } from '../test-setup';
import { getTargetChainId } from '../utils';

describeIfSupported(
  getTargetChainId(),
  ['RiskEngineFromFactoryV1_MarketListed', 'PToken_Deposit'],
  'PToken Deposit Event Indexing',
  () => {
    let testSetup: TestSetup;
    let dbClient: Client;
    const chainId = parseInt(getTargetChainId());

    beforeAll(async () => {
      testSetup = await setupTest(chainId, [
        'RiskEngineFromFactoryV1_MarketListed',
        'PToken_Deposit',
      ]);

      dbClient = testSetup.dbClient;
    });

    afterAll(async () => {
      await testSetup.cleanup();
    });

    test('should index Deposit event', async () => {
      const result = await dbClient.query(
        `
          SELECT * FROM "transaction"
          WHERE chain_id = $1
        `,
        [getTargetChainId()]
      );

      expect(result.rows.length).toBeGreaterThanOrEqual(2);
    });
  }
);
