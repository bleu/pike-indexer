import { spawn } from 'child_process';
import { Client } from 'pg';
import {
  getBlockRange,
  getEventBlocks,
  resetPonderEnvironment,
  waitForIndexing,
} from './utils';

export type TestSetup = {
  dbClient: Client;
  ponderProcess: any;
  cleanup: () => Promise<void>;
};

/**
 * Sets up a test environment for a specific chain and event list
 * Handles database connection, block range setup, ponder process spawning, and indexing
 *
 * @param chainId The chain ID to test
 * @param eventNames The list of event names to test
 * @param options Additional options for the setup
 * @returns Setup objects including database client, ponder process and cleanup function
 */
export async function setupTest(
  chainId: number,
  eventNames: string[],
  isDev = true,
  options: {
    timeoutMs?: number;
    additionalEnvVars?: Record<string, string>;
  } = {}
): Promise<TestSetup> {
  const eventBlocks = getEventBlocks(chainId, eventNames);
  const { startBlock, endBlock } = getBlockRange(eventBlocks);

  eventNames.forEach(event => {
    process.env[`TEST_EVENT_${event}`] = 'true';
  });

  await resetPonderEnvironment();

  process.env[`TEST_${chainId}_START_BLOCK`] = `${startBlock}`;
  process.env[`TEST_${chainId}_END_BLOCK`] = `${endBlock}`;

  console.log(
    `Setting block range for chain ${chainId}: ${startBlock} - ${endBlock}`
  );

  const dbClient = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await dbClient.connect();

  const envVars = {
    ...process.env,
    INDEXER_ENV: 'test',
    ...options.additionalEnvVars,
  };

  const ponderProcess = spawn('ponder', [isDev ? 'dev' : 'start'], {
    stdio: 'inherit',
    env: envVars,
  });
  console.log(`Ponder started for chain ${chainId}`);

  await waitForIndexing(dbClient, endBlock, options.timeoutMs);

  console.log('Ponder indexing completed');

  return {
    dbClient,
    ponderProcess,
    cleanup: async () => {
      if (ponderProcess) {
        ponderProcess.kill();
      }
      await dbClient.end();
    },
  };
}
