import { defineChain } from 'viem';
import {
  arbitrumSepolia,
  baseSepolia,
  // monadTestnet,
  optimismSepolia,
} from 'viem/chains';

export const hyperliquidTestnet = defineChain({
  id: 998,
  name: 'Hyperliquid Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'HYPE',
    symbol: 'HYPE',
  },
  rpcUrls: {
    default: {
      http: ['https://api.hyperliquid-testnet.xyz/evm'],
    },
  },
  blockExplorers: {
    default: {
      name: 'HyperliquidExplorer',
      url: 'https://testnet.purrsec.com/',
    },
  },
  contracts: {
    multicall3: {
      address: '0x0e2ef7AEEef695F9c8D463ce31561B43EC14e453',
      blockCreated: 18219038,
    },
  },
  testnet: true,
});

export type ChainId =
  | typeof baseSepolia.id
  | typeof optimismSepolia.id
  | typeof arbitrumSepolia.id;
// | typeof monadTestnet.id;
// TODO: PIKE-124
// | typeof hyperliquidTestnet.id;
