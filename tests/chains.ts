import { describe } from '@jest/globals';

export type EventConfigMap = Record<string, number>;

export const CHAIN_EVENTS: Record<string, EventConfigMap> = {
  '84532': {
    RiskEngineFromFactoryV0_NewEModeConfiguration: 20382014,
    RiskEngineFromFactoryV0_EModeUpdated: 20382013,
    RiskEngineFromFactoryV1_EModeSwitched: 20381088,
    Factory_ProtocolDeployed_V0: 19991778,
    Factory_ProtocolDeployed_V1: 20518090,
    RiskEngineFromFactoryV1_MarketListed: 19991778,
    PToken_Deposit: 20251823,
  },
  '11155420': {},
};

export function shouldRunTest(
  requiredChainId: string | number,
  requiredEvents: string[]
): boolean {
  const targetChainId = process.env.TARGET_CHAIN_ID;
  const chainIdStr = requiredChainId.toString();

  if (!targetChainId || targetChainId === chainIdStr) {
    const chainEvents = CHAIN_EVENTS[chainIdStr];
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
  const chainEvents = CHAIN_EVENTS[chainIdStr];

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
