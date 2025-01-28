export interface IPTokenRateModelData {
  totalBorrows: bigint;
  cash: bigint;
  totalReserves: bigint;
  firstKink: bigint;
  secondKink: bigint;
  multiplierPerSecond: bigint;
  baseRatePerSecond: bigint;
  firstJumpMultiplierPerSecond: bigint;
  secondJumpMultiplierPerSecond: bigint;
  reserveFactor: bigint;
}

export interface IUserMetricsBalanceData {
  borrowAssets: bigint;
  interestIndex: bigint;
  supplyShares: bigint;
  isCollateral: boolean;
}

export interface IUserMetricsPTokenData {
  id: string;
  underlyingPriceCurrent: bigint; // underlying price in USD with 18 decimals
  borrowIndex: bigint;
  exchangeRateCurrent: bigint;
  borrowRateAPY: string;
  supplyRateAPY: string;
  liquidationThreshold: bigint;
}

export type IUserMetricsData = {
  userBalance: IUserMetricsBalanceData;
  pToken: IUserMetricsPTokenData;
  eMode: { liquidationThreshold: bigint } | null;
}[];
