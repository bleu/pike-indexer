import { createConfig, factory } from 'ponder';
import { http, parseAbiItem } from 'viem';

import { baseSepolia } from 'viem/chains';
import { FactoryAbi } from './abis/FactoryAbi';
import { RiskEngineAbi } from './abis/RiskEngineAbi';
import { PTokenAbi } from './abis/PTokenAbi';
import { BeaconAbi } from './abis/BeaconAbi';

const FACTORY = {
  [baseSepolia.id]: {
    address: '0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D',
    startBlock: 19991778,
  } as const,
};

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: baseSepolia.id,
      transport: http(process.env.BASE_SEPOLIA_RPC_URL),
    },
  },
  blocks: {
    CurrentPriceUpdate: {
      network: 'baseSepolia',
      startBlock: FACTORY[baseSepolia.id].startBlock,
      interval: (60 * 60) / 2, // 1 hour
    },
    PriceSnapshotUpdate: {
      network: 'baseSepolia',
      startBlock: FACTORY[baseSepolia.id].startBlock + 1, // plus one to get snapshot after price update
      interval: (60 * 60 * 24) / 2, // 1 day
    },
    APRSnapshotUpdate: {
      network: 'baseSepolia',
      startBlock: FACTORY[baseSepolia.id].startBlock + 1, // plus one to get snapshot after price update
      interval: (60 * 60 * 24) / 2, // 1 day
    },
  },
  contracts: {
    Factory: {
      network: 'baseSepolia',
      abi: FactoryAbi,
      address: FACTORY[baseSepolia.id].address,
      startBlock: FACTORY[baseSepolia.id].startBlock,
    },
    RiskEngine: {
      network: 'baseSepolia',
      address: factory({
        address: FACTORY[baseSepolia.id].address,
        event: parseAbiItem(
          'event ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)'
        ),
        parameter: 'riskEngine',
      }),
      startBlock: FACTORY[baseSepolia.id].startBlock,
      abi: RiskEngineAbi,
    },
    PToken: {
      network: 'baseSepolia',
      address: factory({
        address: FACTORY[baseSepolia.id].address,
        event: parseAbiItem(
          'event PTokenDeployed(uint256 indexed protocolId, uint256 indexed index, address indexed pToken, address timelock)'
        ),
        parameter: 'pToken',
      }),
      abi: PTokenAbi,
      startBlock: FACTORY[baseSepolia.id].startBlock,
    },
    Beacon: {
      network: 'baseSepolia',
      address: [
        '0x31c0F9E464Ee26E1de70676EF135875a38ED1D5c',
        '0x419aDB9e3Aa8B89b25915689332905a04528Abf6',
        '0xdEDA2fFc4F212c41f1a54c3a6136Df0BFaEcAeEC',
        '0x8f3362a4Da07C9D7F59f9332B0F4c09Db8A89e41',
      ],
      startBlock: 19989047,
      abi: BeaconAbi,
    },
  },
});
