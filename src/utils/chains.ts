import {
  arbitrumSepolia,
  baseSepolia,
  berachainTestnetbArtio,
  optimismSepolia,
} from 'viem/chains';

export type ChainId =
  | typeof baseSepolia.id
  | typeof optimismSepolia.id
  | typeof arbitrumSepolia.id
  | typeof berachainTestnetbArtio.id;
