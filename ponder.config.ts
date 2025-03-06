import { createConfig, factory } from 'ponder';
import { http, parseAbiItem, Address, fallback } from 'viem';
import {
  arbitrumSepolia,
  baseSepolia,
  // monadTestnet,
  optimismSepolia,
} from 'viem/chains';
import { FactoryAbi } from './abis/FactoryAbi';
import { RiskEngineAbi } from './abis/RiskEngineAbi';
import { PTokenAbi } from './abis/PTokenAbi';
import { ChainId } from './src/utils/chains';

const HOUR = 60 * 60;

interface ChainConfig {
  chainId: ChainId;
  factoryAddress: Address;
  factoryStartBlock: number;
  blockTime: number;
  rpcEnvKeys: string[];
}

const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [baseSepolia.id]: {
    chainId: baseSepolia.id,
    factoryAddress: '0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D' as Address,
    factoryStartBlock: 19991778,
    blockTime: 2,
    rpcEnvKeys: ['BASE_SEPOLIA_RPC_URL'],
  },
  [optimismSepolia.id]: {
    chainId: optimismSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: 22061870,
    blockTime: 2,
    rpcEnvKeys: ['OPTIMISM_SEPOLIA_RPC_URL'],
  },
  [arbitrumSepolia.id]: {
    chainId: arbitrumSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: 112780355,
    blockTime: 0.2,
    rpcEnvKeys: ['ARBITRUM_SEPOLIA_RPC_URL'],
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
