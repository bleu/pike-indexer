import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { Client } from 'pg';
import { setupTest, TestSetup } from '../test-setup';
import { describeIfSupported, getTargetChainId } from '../utils';

const targetEvents = ['PToken_Borrow'];
describeIfSupported(
  getTargetChainId(),
  targetEvents,
  'PToken Borrow Event Indexing',
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

    test('Should index PToken_Borrow event', async () => {
      const result = await dbClient.query(
        `
          SELECT * FROM "borrow"
          WHERE chain_id = $1
        `,
        [getTargetChainId()]
      );
      expect(result.rows.length).toBe(1);
    });
  }
);
