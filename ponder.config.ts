import { createConfig, factory } from 'ponder';
import { http, parseAbiItem } from 'viem';

import { baseSepolia } from 'viem/chains';
import { FactoryAbi } from './abis/FactoryAbi';
import { RiskEngineAbi } from './abis/RiskEngineAbi';
import { PTokenAbi } from './abis/PTokenAbi';

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
      // Interval is still TBD, we will use a larger one for save on RPC calls for now
      interval: (60 * 60 * 6) / 2, // 6 hours
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
  },
});
