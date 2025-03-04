// src/test/EModeConfig.test.ts
import { afterAll, beforeAll, expect, test } from '@jest/globals';
import { Client } from 'pg';
import { setupTest, TestSetup } from '../test-setup';
import { describeIfSupported, getTargetChainId } from '../utils';

describeIfSupported(
  getTargetChainId(),
  [
    'RiskEngineFromFactoryV0_NewEModeConfiguration',
    'RiskEngineFromFactoryV0_EModeUpdated',
  ],
  'RiskEngineFromFactoryV0 NewEModeConfiguration and EModeUpdated Event Indexing',
  () => {
    let testSetup: TestSetup;
    let dbClient: Client;
    const chainId = parseInt(getTargetChainId());

    beforeAll(async () => {
      testSetup = await setupTest(chainId, [
        'RiskEngineFromFactoryV0_NewEModeConfiguration',
        'RiskEngineFromFactoryV0_EModeUpdated',
      ]);

      dbClient = testSetup.dbClient;
    });

    afterAll(async () => {
      await testSetup.cleanup();
    });

    test('should index EMode configuration events', async () => {
      const result = await dbClient.query(
        `
        SELECT * FROM "eMode"
        WHERE chain_id = $1
        AND collateral_factor != '0'
        LIMIT 1
      `,
        [chainId]
      );

      expect(result.rows.length).toBeGreaterThan(0);

      const eMode = result.rows[0];
      expect(eMode).toMatchObject({
        chain_id: chainId.toString(),
      });
    });
  }
);

describeIfSupported(
  getTargetChainId(),
  ['RiskEngineFromFactoryV0_EModeSwitched'],
  'RiskEngineFromFactoryV0 EModeSwitched Event Indexing',
  () => {
    let testSetup: TestSetup;
    let dbClient: Client;
    const chainId = parseInt(getTargetChainId());

    beforeAll(async () => {
      testSetup = await setupTest(chainId, [
        'RiskEngineFromFactoryV0_EModeSwitched',
      ]);

      dbClient = testSetup.dbClient;
    });

    afterAll(async () => {
      await testSetup.cleanup();
    });

    test('should index EModeSwitched events', async () => {
      const result = await dbClient.query(
        `
        SELECT * FROM "userEMode"
        WHERE chain_id = $1
        AND e_mode_id != '0'
        LIMIT 1
      `,
        [chainId]
      );

      expect(result.rows.length).toBeGreaterThan(0);

      const eMode = result.rows[0];
      expect(eMode).toMatchObject({
        chain_id: chainId.toString(),
      });
    });
  }
);
