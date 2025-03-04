import { createConfig, factory } from 'ponder';
import { http, parseAbiItem, Address, fallback } from 'viem';
import {
  arbitrumSepolia,
  baseSepolia,
  berachainTestnetbArtio,
  monadTestnet,
  optimismSepolia,
} from 'viem/chains';
import { FactoryAbi } from './abis/FactoryAbi';
import { RiskEngineAbi } from './abis/RiskEngineAbi';
import { PTokenAbi } from './abis/PTokenAbi';
import { ChainId } from './src/utils/chains';
import { CONTRACT_ADDRESSES } from './tests/addressBook';

const HOUR = 60 * 60;

interface ChainConfig {
  chainId: ChainId;
  factoryAddress: Address;
  factoryStartBlock: number;
  factoryEndBlock?: number;
  blockTime: number;
  rpcEnvKeys: string[];
}

interface BlockRangeConfig {
  start: number;
  end?: number;
}

const DEFAULT_BLOCK_CONFIGS: Record<number, { start: number }> = {
  [baseSepolia.id]: { start: 19991778 },
  [optimismSepolia.id]: { start: 22061870 },
  [arbitrumSepolia.id]: { start: 112780355 },
  [berachainTestnetbArtio.id]: { start: 10268951 },
  [monadTestnet.id]: { start: 2895130 },
};

const getChainBlockConfig = (chainId: number): BlockRangeConfig => {
  const defaultStart = DEFAULT_BLOCK_CONFIGS[chainId]?.start || 0;

  if (process.env.INDEXER_ENV === 'test') {
    const startBlockEnv = process.env[`TEST_${chainId}_START_BLOCK`];
    const endBlockEnv = process.env[`TEST_${chainId}_END_BLOCK`];

    const startBlock = startBlockEnv ? parseInt(startBlockEnv) : defaultStart;

    const targetChainId = process.env.TARGET_CHAIN_ID;
    if (
      !endBlockEnv &&
      (!targetChainId || targetChainId === chainId.toString())
    ) {
      throw new Error(
        `Missing test end block configuration for chain ${chainId}`
      );
    }

    return {
      start: startBlock,
      end: endBlockEnv ? parseInt(endBlockEnv) : undefined,
    };
  }

  return { start: defaultStart };
};

const ALL_CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [baseSepolia.id]: {
    chainId: baseSepolia.id,
    factoryAddress: '0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D' as Address,
    factoryStartBlock: getChainBlockConfig(baseSepolia.id).start,
    ...(process.env.INDEXER_ENV === 'test' && {
      factoryEndBlock: getChainBlockConfig(baseSepolia.id).end,
    }),
    blockTime: 2,
    rpcEnvKeys: ['BASE_SEPOLIA_RPC_URL'],
  },
  [optimismSepolia.id]: {
    chainId: optimismSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: getChainBlockConfig(optimismSepolia.id).start,
    ...(process.env.INDEXER_ENV === 'test' && {
      factoryEndBlock: getChainBlockConfig(optimismSepolia.id).end,
    }),
    blockTime: 2,
    rpcEnvKeys: ['OPTIMISM_SEPOLIA_RPC_URL'],
  },
  [arbitrumSepolia.id]: {
    chainId: arbitrumSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: getChainBlockConfig(arbitrumSepolia.id).start,
    ...(process.env.INDEXER_ENV === 'test' && {
      factoryEndBlock: getChainBlockConfig(arbitrumSepolia.id).end,
    }),
    blockTime: 0.2,
    rpcEnvKeys: ['ARBITRUM_SEPOLIA_RPC_URL'],
  },
  [berachainTestnetbArtio.id]: {
    chainId: berachainTestnetbArtio.id,
    factoryAddress: '0x0e2ef7AEEef695F9c8D463ce31561B43EC14e453' as Address,
    factoryStartBlock: getChainBlockConfig(berachainTestnetbArtio.id).start,
    ...(process.env.INDEXER_ENV === 'test' && {
      factoryEndBlock: getChainBlockConfig(berachainTestnetbArtio.id).end,
    }),
    blockTime: 2,
    rpcEnvKeys: ['BERACHAIN_TESTNET_BARTIO_RPC_URL'],
  },
  [monadTestnet.id]: {
    chainId: monadTestnet.id,
    factoryAddress: '0x0e2ef7AEEef695F9c8D463ce31561B43EC14e453' as Address,
    factoryStartBlock: getChainBlockConfig(monadTestnet.id).start,
    ...(process.env.INDEXER_ENV === 'test' && {
      factoryEndBlock: getChainBlockConfig(monadTestnet.id).end,
    }),
    blockTime: 0.5,
    rpcEnvKeys: ['MONAD_TESTNET_RPC_URL_1', 'MONAD_TESTNET_RPC_URL_2'],
  },
  // TODO: PIKE-124
  // [hyperliquidTestnet.id]: {
  //   chainId: hyperliquidTestnet.id,
  //   factoryAddress: '0xe9A6F322D8aB0722c9B2047612168BB85F184Ae4',
  //   factoryStartBlock: 18219039,
  //   blockTime: 2,
  //   rpcEnvKey: 'HYPERLIQUID_TESTNET_RPC_URL',
  // },
};

const getChainConfigs = (): Record<ChainId, ChainConfig> => {
  if (process.env.INDEXER_ENV === 'test' && process.env.TARGET_CHAIN_ID) {
    const targetChainId = parseInt(process.env.TARGET_CHAIN_ID) as ChainId;

    if (!ALL_CHAIN_CONFIGS[targetChainId]) {
      throw new Error(`Invalid target chain ID: ${targetChainId}`);
    }

    console.log(`Running in test mode for chain ${targetChainId} only`);

    return {
      [targetChainId]: ALL_CHAIN_CONFIGS[targetChainId],
    } as Record<ChainId, ChainConfig>;
  }

  return ALL_CHAIN_CONFIGS;
};

const CHAIN_CONFIGS = getChainConfigs();

interface NetworkConfig {
  chainId: number;
  transport: ReturnType<typeof http>;
}

const createNetworkConfigs = (): Record<string, NetworkConfig> => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    return {
      ...acc,
      [networkName]: {
        chainId: parseInt(chainId),
        transport: fallback(
          config.rpcEnvKeys.map(key => http(process.env[key]))
        ),
      },
    };
  }, {});
};

interface BlockNetworkConfig {
  startBlock: number;
  interval: number;
}

type BlockConfig = {
  network: Record<string, BlockNetworkConfig>;
};

const createCurrentPriceUpdateConfig = (): BlockConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    return {
      ...acc,
      [networkName]: {
        startBlock: config.factoryStartBlock,
        interval: Math.round(HOUR / config.blockTime),
        ...(process.env.INDEXER_ENV === 'test' && {
          endBlock: config.factoryEndBlock,
        }),
      },
    };
  }, {});
};

const createPriceSnapshotUpdateConfig = (): BlockConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    return {
      ...acc,
      [networkName]: {
        startBlock: config.factoryStartBlock,
        interval: Math.round(HOUR / config.blockTime),
        ...(process.env.INDEXER_ENV === 'test' && {
          endBlock: config.factoryEndBlock,
        }),
      },
    };
  }, {});
};

const createAPRSnapshotUpdateConfig = (): BlockConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    return {
      ...acc,
      [networkName]: {
        startBlock: config.factoryStartBlock,
        interval: Math.round(HOUR / config.blockTime),
        ...(process.env.INDEXER_ENV === 'test' && {
          endBlock: config.factoryEndBlock,
        }),
      },
    };
  }, {});
};

interface ContractNetworkConfig<T> {
  address: T;
  startBlock: number;
}

type FactoryConfig = {
  network: Record<string, ContractNetworkConfig<Address>>;
  abi: typeof FactoryAbi;
};

type RiskEngineConfig = {
  network: Record<string, ContractNetworkConfig<ReturnType<typeof factory>>>;
  abi: typeof RiskEngineAbi;
};

type PTokenConfig = {
  network: Record<string, ContractNetworkConfig<ReturnType<typeof factory>>>;
  abi: typeof PTokenAbi;
};

const createFactoryConfig = (): FactoryConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    return {
      ...acc,
      [networkName]: {
        address: config.factoryAddress,
        startBlock: config.factoryStartBlock,
        ...(process.env.INDEXER_ENV === 'test' && {
          endBlock: config.factoryEndBlock,
        }),
      },
    };
  }, {});
};

const createRiskEngineV0Config = (): RiskEngineConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    const chainIdNum = parseInt(chainId);
    const address =
      process.env.INDEXER_ENV !== 'test'
        ? factory({
            address: config.factoryAddress,
            event: parseAbiItem(
              'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)'
            ),
            parameter: 'riskEngine',
          })
        : (CONTRACT_ADDRESSES[chainIdNum as keyof typeof CONTRACT_ADDRESSES]
            .riskEngine as Address);

    return {
      ...acc,
      [networkName]: {
        address,
        startBlock: config.factoryStartBlock,
        ...(process.env.INDEXER_ENV === 'test' && {
          endBlock: config.factoryEndBlock,
        }),
      },
    };
  }, {});
};

const createRiskEngineV1Config = (): RiskEngineConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    const address =
      process.env.INDEXER_ENV !== 'test'
        ? factory({
            address: config.factoryAddress,
            event: parseAbiItem(
              'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address oracleEngine, address initialGovernor)'
            ),
            parameter: 'riskEngine',
          })
        : undefined;

    return {
      ...acc,
      [networkName]: {
        address,
        startBlock: config.factoryStartBlock,
        ...(process.env.INDEXER_ENV === 'test' && {
          endBlock: config.factoryEndBlock,
        }),
      },
    };
  }, {});
};

const createPTokenConfig = (): PTokenConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    const chainIdNum = parseInt(chainId);
    const address =
      process.env.INDEXER_ENV !== 'test'
        ? factory({
            address: config.factoryAddress,
            event: parseAbiItem(
              'event PTokenDeployed(uint256 indexed protocolId, uint256 indexed index, address indexed pToken, address timelock)'
            ),
            parameter: 'pToken',
          })
        : (CONTRACT_ADDRESSES[chainIdNum as keyof typeof CONTRACT_ADDRESSES]
            .pTokens as Address[]);

    return {
      ...acc,
      [networkName]: {
        address,
        startBlock: config.factoryStartBlock,
        ...(process.env.INDEXER_ENV === 'test' && {
          endBlock: config.factoryEndBlock,
        }),
      },
    };
  }, {});
};

export default createConfig({
  networks: createNetworkConfigs(),
  // database: {
  //   kind: 'postgres',
  // },
  blocks: {
    CurrentPriceUpdate: {
      network: createCurrentPriceUpdateConfig(),
    },
    PriceSnapshotUpdate: {
      network: createPriceSnapshotUpdateConfig(),
    },
    APRSnapshotUpdate: {
      network: createAPRSnapshotUpdateConfig(),
    },
  },
  contracts: {
    Factory: {
      network: createFactoryConfig(),
      abi: FactoryAbi,
    },
    RiskEngineFromFactoryV0: {
      network: createRiskEngineV0Config(),
      abi: RiskEngineAbi,
    },
    RiskEngineFromFactoryV1: {
      network: createRiskEngineV1Config(),
      abi: RiskEngineAbi,
    },
    PToken: {
      network: createPTokenConfig(),
      abi: PTokenAbi,
    },
  },
});
