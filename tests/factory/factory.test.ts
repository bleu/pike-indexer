import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { Client } from 'pg';
import { setupTest, TestSetup } from '../test-setup';
import { describeIfSupported, getTargetChainId } from '../utils';

describeIfSupported(
  getTargetChainId(),
  ['Factory_ProtocolDeployed_V0'],
  'Factory ProtocolDeployed V0 Event Indexing',
  () => {
    let testSetup: TestSetup;
    let dbClient: Client;
    const chainId = parseInt(getTargetChainId());

    beforeAll(async () => {
      testSetup = await setupTest(chainId, ['Factory_ProtocolDeployed_V0']);

      dbClient = testSetup.dbClient;
    });

    afterAll(async () => {
      await testSetup.cleanup();
    });

    test('should index ProtocolDeployed event', async () => {
      const result = await dbClient.query(
        `
          SELECT * FROM "protocol"
        `
      );

      expect(result.rows.length).toBe(1);
    });
  }
);

describeIfSupported(
  getTargetChainId(),
  ['Factory_ProtocolDeployed_V1'],
  'Factory ProtocolDeployed V1 Event Indexing',
  () => {
    let testSetup: TestSetup;
    let dbClient: Client;
    const chainId = parseInt(getTargetChainId());

    beforeAll(async () => {
      testSetup = await setupTest(chainId, ['Factory_ProtocolDeployed_V1']);

      dbClient = testSetup.dbClient;
    });

    afterAll(async () => {
      await testSetup.cleanup();
    });

    test('should index ProtocolDeployed event', async () => {
      const result = await dbClient.query(
        `
          SELECT * FROM "protocol"
        `
      );

      expect(result.rows.length).toBe(1);
    });
  }
);
