import { Address } from 'viem';

export interface TokenInfo {
  address: Address;
  pTokenAddress: Address;
  price: bigint;
  decimals: bigint;
}

export interface UserPosition {
  deposited: bigint;
  borrowed: bigint;
  inMarket: boolean;
  underlyingBalance: bigint;
}

export type TokenPositions = Record<Address, UserPosition>;

export type TokenKey = 'steth' | 'usdc' | 'weth';

export type Action = 'borrow' | 'withdraw' | 'deposit' | 'repay';

export interface TokenConfig extends Record<TokenKey, TokenInfo> {}
