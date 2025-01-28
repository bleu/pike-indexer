import { etherToWei, MathSol, weiToEther } from './math';
import {
  IUserMetricsPTokenData,
  IUserMetricsBalanceData,
  IUserMetricsData,
} from './types';

const YEAR = BigInt(365 * 24 * 60 * 60);

export function calculateStoredBorrowAssets(
  borrowAssets: bigint,
  borrowIndex: bigint,
  interestIndex: bigint
) {
  return MathSol.divDownFixed(
    MathSol.mulDownFixed(borrowAssets, borrowIndex),
    interestIndex
  );
}

export function sharesToAssets(shares: bigint, exchangeRate: bigint) {
  return MathSol.mulDownFixed(shares, exchangeRate);
}

export function assetsToShares(assets: bigint, exchangeRate: bigint) {
  return MathSol.divDownFixed(assets, exchangeRate);
}

export function currentRatePerSecondToAPY(ratePerSecond: bigint) {
  return weiToEther(ratePerSecond * YEAR);
}

export function calculateUsdValueFromShares(
  shares: bigint,
  exchangeRate: bigint,
  underlyingPrice: bigint // underlying price in USD with 18 decimals
) {
  return weiToEther(
    MathSol.mulDownFixed(sharesToAssets(shares, exchangeRate), underlyingPrice)
  );
}

export function calculateUsdValueFromAssets(
  assets: bigint,
  underlyingPrice: bigint // underlying price in USD with 18 decimals
) {
  return weiToEther(MathSol.mulDownFixed(assets, underlyingPrice));
}

export function calculateUserBalanceMetrics(userBalanceWithPToken: {
  userBalance: IUserMetricsBalanceData;
  pToken: IUserMetricsPTokenData;
}) {
  const storedBorrowAssets = calculateStoredBorrowAssets(
    userBalanceWithPToken.userBalance.borrowAssets,
    userBalanceWithPToken.pToken.borrowIndex,
    userBalanceWithPToken.userBalance.interestIndex
  );

  const supplyAssets = sharesToAssets(
    userBalanceWithPToken.userBalance.supplyShares,
    userBalanceWithPToken.pToken.exchangeRateCurrent
  );

  return {
    storedBorrowAssets,
    supplyAssets,
    borrowUsdValue: calculateUsdValueFromAssets(
      storedBorrowAssets,
      userBalanceWithPToken.pToken.underlyingPriceCurrent
    ),
    supplyUsdValue: calculateUsdValueFromAssets(
      supplyAssets,
      userBalanceWithPToken.pToken.underlyingPriceCurrent
    ),
  };
}

export function calculateNetMetrics(
  data: {
    borrowAPY: string;
    supplyAPY: string;
    borrowUsdValue: string;
    supplyUsdValue: string;
  }[]
) {
  const totalBorrowUsdValue = data.reduce(
    (acc, { borrowUsdValue }) => acc + etherToWei(borrowUsdValue),
    0n
  );

  const totalSupplyUsdValue = data.reduce(
    (acc, { supplyUsdValue }) => acc + etherToWei(supplyUsdValue),
    0n
  );

  const sumBorrowAPY = data.reduce(
    (acc, d) =>
      acc +
      MathSol.mulDownFixed(
        etherToWei(d.borrowUsdValue),
        etherToWei(d.borrowAPY)
      ),
    0n
  );

  const sumSupplyAPY = data.reduce(
    (acc, d) =>
      acc +
      MathSol.mulDownFixed(
        etherToWei(d.supplyUsdValue),
        etherToWei(d.supplyAPY)
      ),
    0n
  );

  const netBorrowAPY = MathSol.divDownFixed(sumBorrowAPY, totalBorrowUsdValue);

  const netSupplyAPY = MathSol.divDownFixed(sumSupplyAPY, totalSupplyUsdValue);

  const isNetAPYNegative = sumBorrowAPY > sumSupplyAPY;

  const netAPYValue = isNetAPYNegative
    ? MathSol.divDownFixed(sumBorrowAPY - sumSupplyAPY, totalBorrowUsdValue)
    : MathSol.divDownFixed(sumSupplyAPY - sumBorrowAPY, totalSupplyUsdValue);

  const netWorth = totalSupplyUsdValue - totalBorrowUsdValue;

  return {
    netBorrowUsdValue: weiToEther(totalBorrowUsdValue),
    netSupplyUsdValue: weiToEther(totalSupplyUsdValue),
    netBorrowAPY: weiToEther(netBorrowAPY),
    netSupplyAPY: weiToEther(netSupplyAPY),
    netAPY: `${isNetAPYNegative ? '-' : ''}${weiToEther(netAPYValue)}`,
    netWorth: weiToEther(netWorth),
  };
}

export function calculateUserMetricsOnProtocol(data: IUserMetricsData) {
  const userBalances = data.map(d => {
    const metrics = calculateUserBalanceMetrics(d);

    return {
      ...d,
      metrics,
    };
  });

  const netMetrics = calculateNetMetrics(
    userBalances.map(({ metrics, pToken }) => ({
      ...metrics,
      borrowAPY: pToken.borrowRateAPY,
      supplyAPY: pToken.supplyRateAPY,
    }))
  );

  const totalCollateralWithLiquidationThreshold = userBalances.reduce(
    (acc, { metrics, eMode, pToken, userBalance }) => {
      if (!userBalance.isCollateral) return acc;

      const liquidationThreshold = eMode
        ? eMode.liquidationThreshold
        : pToken.liquidationThreshold;

      return (
        acc +
        MathSol.divDownFixed(
          etherToWei(metrics.supplyUsdValue),
          liquidationThreshold
        )
      );
    },
    0n
  );

  const healthIndex = MathSol.divDownFixed(
    totalCollateralWithLiquidationThreshold,
    etherToWei(netMetrics.netBorrowUsdValue)
  );

  return {
    healthIndex: weiToEther(healthIndex),
    ...netMetrics,
    pTokenMetrics: userBalances.map(({ metrics, pToken }) => ({
      ...metrics,
      pTokenId: pToken.id,
    })),
  };
}
