import { pToken, userBalance } from 'ponder:schema';
import { MathSol } from './math';
import { formatEther, parseEther } from 'viem';
import { UserProtocolPTokenQueryResult } from './types';

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
  return formatEther(ratePerSecond * YEAR);
}

export function calculateUsdValueFromShares(
  shares: bigint,
  exchangeRate: bigint,
  underlyingPrice: bigint
) {
  return formatEther(
    MathSol.mulDownFixed(sharesToAssets(shares, exchangeRate), underlyingPrice)
  );
}

export function calculateUsdValueFromAssets(
  assets: bigint,
  underlyingPrice: bigint
) {
  return formatEther(MathSol.mulDownFixed(assets, underlyingPrice));
}

export function calculateUserBalanceMetrics(userBalanceWithPToken: {
  userBalance: typeof userBalance.$inferSelect;
  pToken: typeof pToken.$inferSelect;
}) {
  const storedBorrowAssets = calculateStoredBorrowAssets(
    userBalanceWithPToken.userBalance.borrowAssets,
    userBalanceWithPToken.pToken.borrowIndex,
    userBalanceWithPToken.userBalance.interestIndex
  );

  const supplyAssets = sharesToAssets(
    userBalanceWithPToken.userBalance.supplyShares,
    userBalanceWithPToken.pToken.exchangeRateStored
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
    (acc, { borrowUsdValue }) => acc + parseEther(borrowUsdValue),
    0n
  );

  const totalSupplyUsdValue = data.reduce(
    (acc, { supplyUsdValue }) => acc + parseEther(supplyUsdValue),
    0n
  );

  const sumBorrowAPY = data.reduce(
    (acc, d) =>
      acc +
      MathSol.mulDownFixed(
        parseEther(d.borrowUsdValue),
        parseEther(d.borrowAPY)
      ),
    0n
  );

  const sumSupplyAPY = data.reduce(
    (acc, d) =>
      acc +
      MathSol.mulDownFixed(
        parseEther(d.supplyUsdValue),
        parseEther(d.supplyAPY)
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
    netBorrowUsdValue: formatEther(totalBorrowUsdValue),
    netSupplyUsdValue: formatEther(totalSupplyUsdValue),
    netBorrowAPY: formatEther(netBorrowAPY),
    netSupplyAPY: formatEther(netSupplyAPY),
    netAPY: `${isNetAPYNegative ? '-' : ''}${formatEther(netAPYValue)}`,
    netWorth: formatEther(netWorth),
  };
}

export function calculateUserMetricsOnProtocol(
  data: UserProtocolPTokenQueryResult[]
) {
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
          parseEther(metrics.supplyUsdValue),
          liquidationThreshold
        )
      );
    },
    0n
  );

  const healthIndex = MathSol.divDownFixed(
    totalCollateralWithLiquidationThreshold,
    parseEther(netMetrics.netBorrowUsdValue)
  );

  return {
    healthIndex: formatEther(healthIndex),
    ...netMetrics,
    pTokenMetrics: userBalances.map(({ metrics, pToken }) => ({
      ...metrics,
      pTokenId: pToken.id,
    })),
  };
}
