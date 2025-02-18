import { createConfig, factory } from 'ponder';
import { http, parseAbiItem, Address } from 'viem';
import {
  arbitrumSepolia,
  baseSepolia,
  berachainTestnetbArtio,
  optimismSepolia,
} from 'viem/chains';
import { FactoryAbi } from './abis/FactoryAbi';
import { RiskEngineAbi } from './abis/RiskEngineAbi';
import { PTokenAbi } from './abis/PTokenAbi';
import { ChainId } from './src/utils/chains';

const HOUR = 60 * 60;
const DAY = HOUR * 24;

interface ChainConfig {
  chainId: ChainId;
  factoryAddress: Address;
  factoryStartBlock: number;
  blockTime: number;
  rpcEnvKey: string;
}

const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [baseSepolia.id]: {
    chainId: baseSepolia.id,
    factoryAddress: '0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D' as Address,
    factoryStartBlock: 19991778,
    blockTime: 2,
    rpcEnvKey: 'BASE_SEPOLIA_RPC_URL',
  },
  [optimismSepolia.id]: {
    chainId: optimismSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: 22061870,
    blockTime: 2,
    rpcEnvKey: 'OPTIMISM_SEPOLIA_RPC_URL',
  },
  [arbitrumSepolia.id]: {
    chainId: arbitrumSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: 112780355,
    blockTime: 0.2,
    rpcEnvKey: 'ARBITRUM_SEPOLIA_RPC_URL',
  },
  [berachainTestnetbArtio.id]: {
    chainId: berachainTestnetbArtio.id,
    factoryAddress: '0x0e2ef7AEEef695F9c8D463ce31561B43EC14e453',
    factoryStartBlock: 10268951,
    blockTime: 2,
    rpcEnvKey: 'BERACHAIN_TESTNET_BARTIO_RPC_URL',
  },
};

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
        transport: http(process.env[config.rpcEnvKey]),
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

    return {
      ...acc,
      [networkName]: {
        address: factory({
          address: config.factoryAddress,
          event: parseAbiItem(
            'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)'
          ),
          parameter: 'riskEngine',
        }),
        startBlock: config.factoryStartBlock,
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

    return {
      ...acc,
      [networkName]: {
        address: factory({
          address: config.factoryAddress,
          event: parseAbiItem(
            'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address oracleEngine, address initialGovernor)'
          ),
          parameter: 'riskEngine',
        }),
        startBlock: config.factoryStartBlock,
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

    return {
      ...acc,
      [networkName]: {
        address: factory({
          address: config.factoryAddress,
          event: parseAbiItem(
            'event PTokenDeployed(uint256 indexed protocolId, uint256 indexed index, address indexed pToken, address timelock)'
          ),
          parameter: 'pToken',
        }),
        startBlock: config.factoryStartBlock,
      },
    };
  }, {});
};

export default createConfig({
  networks: createNetworkConfigs(),
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
