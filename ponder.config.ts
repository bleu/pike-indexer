import { createConfig, factory } from 'ponder';
import { http, parseAbiItem, Address } from 'viem';
import { arbitrumSepolia, baseSepolia, optimismSepolia } from 'viem/chains';
import { FactoryAbi } from './abis/FactoryAbi';
import { RiskEngineAbi } from './abis/RiskEngineAbi';
import { PTokenAbi } from './abis/PTokenAbi';
import { BeaconAbi } from './abis/BeaconAbi';

const HOUR = 60 * 60;

type ChainId =
  | typeof baseSepolia.id
  | typeof optimismSepolia.id
  | typeof arbitrumSepolia.id;

interface ChainConfig {
  chainId: ChainId;
  factoryAddress: Address;
  factoryStartBlock: number;
  blockTime: number;
  beaconAddresses: Address[];
  beaconStartBlock: number;
  rpcEnvKey: string;
}

const CHAIN_CONFIGS: Record<ChainId, ChainConfig> = {
  [baseSepolia.id]: {
    chainId: baseSepolia.id,
    factoryAddress: '0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D' as Address,
    factoryStartBlock: 19991778,
    blockTime: 2,
    beaconAddresses: [
      '0x31c0F9E464Ee26E1de70676EF135875a38ED1D5c',
      '0x419aDB9e3Aa8B89b25915689332905a04528Abf6',
      '0xdEDA2fFc4F212c41f1a54c3a6136Df0BFaEcAeEC',
      '0x8f3362a4Da07C9D7F59f9332B0F4c09Db8A89e41',
    ] as Address[],
    beaconStartBlock: 19989047,
    rpcEnvKey: 'BASE_SEPOLIA_RPC_URL',
  },
  [optimismSepolia.id]: {
    chainId: optimismSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: 22061870,
    blockTime: 2,
    beaconAddresses: [
      '0x68c81Ac75689e20a18Ff00Ab9f4AAAb2d99912f7',
      '0xfdc91BdDc40D71aC91db9B9ea3beaA939b85f4fc',
      '0x68c81Ac75689e20a18Ff00Ab9f4AAAb2d99912f7',
      '0x1Dba4Ed49f6949aAb39abA2d59211fc657546719',
    ] as Address[],
    beaconStartBlock: 22061839,
    rpcEnvKey: 'OPTIMISM_SEPOLIA_RPC_URL',
  },
  [arbitrumSepolia.id]: {
    chainId: arbitrumSepolia.id,
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA' as Address,
    factoryStartBlock: 112780355,
    blockTime: 0.2,
    beaconAddresses: [
      '0x68c81Ac75689e20a18Ff00Ab9f4AAAb2d99912f7',
      '0xfdc91BdDc40D71aC91db9B9ea3beaA939b85f4fc',
      '0x5f45CBcDFD790e5f45D2b5B81E293aaC2EF2b622',
      '0x1Dba4Ed49f6949aAb39abA2d59211fc657546719',
    ] as Address[],
    beaconStartBlock: 112780101,
    rpcEnvKey: 'ARBITRUM_SEPOLIA_RPC_URL',
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

type BeaconConfig = {
  network: Record<string, ContractNetworkConfig<Address[]>>;
  abi: typeof BeaconAbi;
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

const createRiskEngineConfig = (): RiskEngineConfig['network'] => {
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

const createBeaconConfig = (): BeaconConfig['network'] => {
  return Object.entries(CHAIN_CONFIGS).reduce((acc, [chainId, config]) => {
    const networkName =
      Object.keys(config).find(key =>
        key.toLowerCase().includes(chainId.toString())
      ) || chainId;

    return {
      ...acc,
      [networkName]: {
        address: config.beaconAddresses,
        startBlock: config.beaconStartBlock,
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
    RiskEngine: {
      network: createRiskEngineConfig(),
      abi: RiskEngineAbi,
    },
    PToken: {
      network: createPTokenConfig(),
      abi: PTokenAbi,
    },
    Beacon: {
      network: createBeaconConfig(),
      abi: BeaconAbi,
    },
  },
});
