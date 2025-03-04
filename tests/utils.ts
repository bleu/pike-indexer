import { Client } from 'pg';
import { describe } from '@jest/globals';
import { EVENTS } from './events';

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
    resetDatabase: true,
    databaseConnectionString: process.env.DATABASE_URL,
  }
) => {
  console.log('Resetting Ponder environment...');

  if (options.resetDatabase) {
    const dbClient = new Client({
      connectionString: options.databaseConnectionString,
    });

    try {
      await dbClient.connect();

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

export function shouldRunTest(
  requiredChainId: string | number,
  requiredEvents: string[]
): boolean {
  const targetChainId = process.env.TARGET_CHAIN_ID;
  const chainIdStr = requiredChainId.toString();

  if (!targetChainId || targetChainId === chainIdStr) {
    const chainEvents = EVENTS[chainIdStr];
    if (!chainEvents) return false;

    return requiredEvents.every(event => event in chainEvents);
  }

  return false;
}

// Get blocks for required events
export function getEventBlocks(
  chainId: string | number,
  eventNames: string[]
): number[] {
  const chainIdStr = chainId.toString();
  const chainEvents = EVENTS[chainIdStr];

  if (!chainEvents) return [];

  return eventNames
    .filter(event => event in chainEvents)
    .map(event => {
      const blockNumber = chainEvents[event];
      if (blockNumber === undefined) {
        throw new Error(
          `Block number for event ${event} on chain ${chainId} is undefined`
        );
      }
      return blockNumber;
    });
}

export function getBlockRange(eventBlocks: number[]): {
  startBlock: number;
  endBlock: number;
} {
  if (eventBlocks.length === 0) {
    throw new Error('Cannot calculate block range from empty array');
  }

  const startBlock = Math.min(...eventBlocks);
  const endBlock = Math.max(...eventBlocks);

  return { startBlock, endBlock };
}

export function describeIfSupported(
  chainId: string | number,
  requiredEvents: string[],
  name: string,
  fn: () => void
) {
  if (shouldRunTest(chainId, requiredEvents)) {
    return describe(name, fn);
  }
}

export const getTargetChainId = (): string => {
  return process.env.TARGET_CHAIN_ID || '84532';
};
