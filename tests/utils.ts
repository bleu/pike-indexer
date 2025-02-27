import { execSync } from 'child_process';
import { Client } from 'pg';

/**
 * Wait for Ponder indexing to reach a target block
 * Uses the public._ponder_status table to check progress
 */
export const waitForIndexing = async (
  client: Client,
  targetBlock: number,
  maxWaitTime = 300000
) => {
  const startTime = Date.now();
  let lastLoggedBlock = 0;

  console.log(`Waiting for indexing to reach block ${targetBlock}...`);

  while (Date.now() - startTime < maxWaitTime) {
    try {
      // Check if the _ponder_status table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT 1 
          FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '_ponder_status'
        );
      `);

      if (!tableCheck.rows[0].exists) {
        console.log('Waiting for public._ponder_status table to be created...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }

      // Check the status in _ponder_status table
      const result = await client.query(`
        SELECT block_number, ready
        FROM public._ponder_status
        LIMIT 1;
      `);

      if (result.rows.length === 0) {
        console.log('No status information available yet...');
      } else {
        const currentBlock = result.rows[0].block_number;
        const isReady = result.rows[0].ready;

        if (currentBlock !== lastLoggedBlock) {
          console.log(
            `Indexing progress: block ${currentBlock}/${targetBlock} (Ready: ${isReady})`
          );
          lastLoggedBlock = currentBlock;
        }

        if (currentBlock >= targetBlock && isReady) {
          console.log(
            `Indexing completed: reached block ${currentBlock} and status is ready`
          );
          return;
        }
      }
    } catch (error) {
      console.log('Error checking indexing status:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  throw new Error(`Indexing timed out after ${maxWaitTime / 1000} seconds`);
};

/**
 * Completely resets the Ponder environment and database
 * Call this before each test suite to ensure a clean state
 */
export const resetPonderEnvironment = async (
  options = {
    clearCache: true,
    resetDatabase: true,
    databaseConnectionString: process.env.DATABASE_URL,
  }
) => {
  console.log('Resetting Ponder environment...');

  // Step 1: Clear Ponder cache
  if (options.clearCache) {
    try {
      console.log('Removing .ponder directory...');
      execSync('rm -rf .ponder', { stdio: 'inherit' });
    } catch (error) {
      console.error('Error clearing Ponder cache:', error);
    }
  }

  // Step 2: Reset the database
  if (options.resetDatabase) {
    const dbClient = new Client({
      connectionString: options.databaseConnectionString,
    });

    try {
      await dbClient.connect();
      console.log('Connected to database, dropping schemas...');

      // Drop the public and ponder_sync schemas
      await dbClient.query(`
        DROP SCHEMA IF EXISTS public CASCADE;
        DROP SCHEMA IF EXISTS ponder_sync CASCADE;
      `);

      console.log('Database reset completed.');
    } catch (error) {
      console.error('Error resetting database:', error);
    } finally {
      await dbClient.end();
    }
  }

  console.log('Reset complete, ready for tests.');
};

/**
 * Setup the test environment variables for a specific chain and block range
 */
export function setupTestEnv(
  chainId: number,
  startBlock: number,
  endBlock: number,
  eventFlags: string[] = []
): void {
  // Set basic test environment
  process.env.NODE_ENV = 'test';
  process.env.TEST_CHAIN_ID = String(chainId);
  process.env[`TEST_${chainId}_START_BLOCK`] = String(startBlock);
  process.env[`TEST_${chainId}_END_BLOCK`] = String(endBlock);

  // Set event flags
  eventFlags.forEach(flag => {
    process.env[flag] = 'true';
  });
}

export const getTargetChainId = (): string => {
  return process.env.TARGET_CHAIN_ID || '84532';
};
