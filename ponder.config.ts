import { createConfig, factory } from 'ponder';
import { http, parseAbiItem } from 'viem';

import { arbitrumSepolia, baseSepolia, optimismSepolia } from 'viem/chains';
import { FactoryAbi } from './abis/FactoryAbi';
import { RiskEngineAbi } from './abis/RiskEngineAbi';
import { PTokenAbi } from './abis/PTokenAbi';
import { BeaconAbi } from './abis/BeaconAbi';

const CHAIN_CONFIG = {
  [baseSepolia.id]: {
    factoryAddress: '0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D',
    factoryStartBlock: 19991778,
    blockTime: 2,
    beaconAddresses: [
      '0x31c0F9E464Ee26E1de70676EF135875a38ED1D5c',
      '0x419aDB9e3Aa8B89b25915689332905a04528Abf6',
      '0xdEDA2fFc4F212c41f1a54c3a6136Df0BFaEcAeEC',
      '0x8f3362a4Da07C9D7F59f9332B0F4c09Db8A89e41',
    ],
    beaconStartBlock: 19989047,
  } as const,
  [optimismSepolia.id]: {
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA',
    factoryStartBlock: 22061870,
    blockTime: 2,
    beaconAddresses: [
      '0x68c81Ac75689e20a18Ff00Ab9f4AAAb2d99912f7',
      '0xfdc91BdDc40D71aC91db9B9ea3beaA939b85f4fc',
      '0x68c81Ac75689e20a18Ff00Ab9f4AAAb2d99912f7',
      '0x1Dba4Ed49f6949aAb39abA2d59211fc657546719',
    ],
    beaconStartBlock: 22061839,
  } as const,
  [arbitrumSepolia.id]: {
    factoryAddress: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA',
    factoryStartBlock: 112780355,
    blockTime: 0.2,
    beaconAddresses: [
      '0x68c81Ac75689e20a18Ff00Ab9f4AAAb2d99912f7',
      '0xfdc91BdDc40D71aC91db9B9ea3beaA939b85f4fc',
      '0x5f45CBcDFD790e5f45D2b5B81E293aaC2EF2b622',
      '0x1Dba4Ed49f6949aAb39abA2d59211fc657546719',
    ],
    beaconStartBlock: 112780101,
  } as const,
};

const HOUR = 60 * 60;
const DAY = HOUR * 24;

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: baseSepolia.id,
      transport: http(process.env.BASE_SEPOLIA_RPC_URL),
    },
    optimismSepolia: {
      chainId: optimismSepolia.id,
      transport: http(process.env.OPTIMISM_SEPOLIA_RPC_URL),
    },
    arbitrumSepolia: {
      chainId: arbitrumSepolia.id,
      transport: http(process.env.ARBITRUM_SEPOLIA_RPC_URL),
    },
  },
  blocks: {
    CurrentPriceUpdate: {
      network: {
        baseSepolia: {
          startBlock: CHAIN_CONFIG[baseSepolia.id].factoryStartBlock,
          interval: Math.round(HOUR / CHAIN_CONFIG[baseSepolia.id].blockTime),
        },
        optimismSepolia: {
          startBlock: CHAIN_CONFIG[optimismSepolia.id].factoryStartBlock,
          interval: Math.round(
            HOUR / CHAIN_CONFIG[optimismSepolia.id].blockTime
          ),
        },
        arbitrumSepolia: {
          startBlock: CHAIN_CONFIG[arbitrumSepolia.id].factoryStartBlock,
          interval: Math.round(
            HOUR / CHAIN_CONFIG[arbitrumSepolia.id].blockTime
          ),
        },
      },
    },
    PriceSnapshotUpdate: {
      network: {
        baseSepolia: {
          startBlock: CHAIN_CONFIG[baseSepolia.id].factoryStartBlock,
          interval: Math.round(DAY / CHAIN_CONFIG[baseSepolia.id].blockTime),
        },
        optimismSepolia: {
          startBlock: CHAIN_CONFIG[optimismSepolia.id].factoryStartBlock,
          interval: Math.round(
            DAY / CHAIN_CONFIG[optimismSepolia.id].blockTime
          ),
        },
        arbitrumSepolia: {
          startBlock: CHAIN_CONFIG[arbitrumSepolia.id].factoryStartBlock,
          interval: Math.round(
            DAY / CHAIN_CONFIG[arbitrumSepolia.id].blockTime
          ),
        },
      },
    },
    APRSnapshotUpdate: {
      network: {
        baseSepolia: {
          startBlock: CHAIN_CONFIG[baseSepolia.id].factoryStartBlock,
          interval: Math.round(DAY / CHAIN_CONFIG[baseSepolia.id].blockTime),
        },
        optimismSepolia: {
          startBlock: CHAIN_CONFIG[optimismSepolia.id].factoryStartBlock,
          interval: Math.round(
            DAY / CHAIN_CONFIG[optimismSepolia.id].blockTime
          ),
        },
        arbitrumSepolia: {
          startBlock: CHAIN_CONFIG[arbitrumSepolia.id].factoryStartBlock,
          interval: Math.round(
            DAY / CHAIN_CONFIG[arbitrumSepolia.id].blockTime
          ),
        },
      },
    },
  },
  contracts: {
    Factory: {
      network: {
        baseSepolia: {
          address: CHAIN_CONFIG[baseSepolia.id].factoryAddress,
          startBlock: CHAIN_CONFIG[baseSepolia.id].factoryStartBlock,
        },
        optimismSepolia: {
          address: CHAIN_CONFIG[optimismSepolia.id].factoryAddress,
          startBlock: CHAIN_CONFIG[optimismSepolia.id].factoryStartBlock,
        },
        arbitrumSepolia: {
          address: CHAIN_CONFIG[arbitrumSepolia.id].factoryAddress,
          startBlock: CHAIN_CONFIG[arbitrumSepolia.id].factoryStartBlock,
        },
      },
      abi: FactoryAbi,
    },
    RiskEngine: {
      network: {
        baseSepolia: {
          address: factory({
            address: CHAIN_CONFIG[baseSepolia.id].factoryAddress,
            event: parseAbiItem(
              'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)'
            ),
            parameter: 'riskEngine',
          }),
          startBlock: CHAIN_CONFIG[baseSepolia.id].factoryStartBlock,
        },
        optimismSepolia: {
          address: factory({
            address: CHAIN_CONFIG[optimismSepolia.id].factoryAddress,
            event: parseAbiItem(
              'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)'
            ),
            parameter: 'riskEngine',
          }),
          startBlock: CHAIN_CONFIG[optimismSepolia.id].factoryStartBlock,
        },
        arbitrumSepolia: {
          address: factory({
            address: CHAIN_CONFIG[arbitrumSepolia.id].factoryAddress,
            event: parseAbiItem(
              'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)'
            ),
            parameter: 'riskEngine',
          }),
          startBlock: CHAIN_CONFIG[arbitrumSepolia.id].factoryStartBlock,
        },
      },
      abi: RiskEngineAbi,
    },
    PToken: {
      network: {
        baseSepolia: {
          address: factory({
            address: CHAIN_CONFIG[baseSepolia.id].factoryAddress,
            event: parseAbiItem(
              'event PTokenDeployed(uint256 indexed protocolId, uint256 indexed index, address indexed pToken, address timelock)'
            ),
            parameter: 'pToken',
          }),
          startBlock: CHAIN_CONFIG[baseSepolia.id].factoryStartBlock,
        },
        optimismSepolia: {
          address: factory({
            address: CHAIN_CONFIG[optimismSepolia.id].factoryAddress,
            event: parseAbiItem(
              'event PTokenDeployed(uint256 indexed protocolId, uint256 indexed index, address indexed pToken, address timelock)'
            ),
            parameter: 'pToken',
          }),
          startBlock: CHAIN_CONFIG[optimismSepolia.id].factoryStartBlock,
        },
        arbitrumSepolia: {
          address: factory({
            address: CHAIN_CONFIG[arbitrumSepolia.id].factoryAddress,
            event: parseAbiItem(
              'event PTokenDeployed(uint256 indexed protocolId, uint256 indexed index, address indexed pToken, address timelock)'
            ),
            parameter: 'pToken',
          }),
          startBlock: CHAIN_CONFIG[arbitrumSepolia.id].factoryStartBlock,
        },
      },
      abi: PTokenAbi,
    },
    Beacon: {
      network: {
        baseSepolia: {
          address: CHAIN_CONFIG[baseSepolia.id].beaconAddresses,
          startBlock: CHAIN_CONFIG[baseSepolia.id].beaconStartBlock,
        },
        optimismSepolia: {
          address: CHAIN_CONFIG[optimismSepolia.id].beaconAddresses,
          startBlock: CHAIN_CONFIG[optimismSepolia.id].beaconStartBlock,
        },
        arbitrumSepolia: {
          address: CHAIN_CONFIG[arbitrumSepolia.id].beaconAddresses,
          startBlock: CHAIN_CONFIG[arbitrumSepolia.id].beaconStartBlock,
        },
      },
      abi: BeaconAbi,
    },
  },
});
