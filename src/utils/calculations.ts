import { eMode, pToken, userBalance } from 'ponder:schema';
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
  user_balance: typeof userBalance.$inferSelect;
  p_token: typeof pToken.$inferSelect;
}) {
  const storedBorrowAssets = calculateStoredBorrowAssets(
    userBalanceWithPToken.user_balance.borrowAssets,
    userBalanceWithPToken.p_token.borrowIndex,
    userBalanceWithPToken.user_balance.interestIndex
  );

  const supplyAssets = sharesToAssets(
    userBalanceWithPToken.user_balance.supplyShares,
    userBalanceWithPToken.p_token.exchangeRateCurrent
  );

  return {
    storedBorrowAssets,
    supplyAssets,
    borrowUsdValue: calculateUsdValueFromAssets(
      storedBorrowAssets,
      userBalanceWithPToken.p_token.underlyingPriceCurrent
    ),
    supplyUsdValue: calculateUsdValueFromAssets(
      supplyAssets,
      userBalanceWithPToken.p_token.underlyingPriceCurrent
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
    userBalances.map(({ metrics, p_token }) => ({
      ...metrics,
      borrowAPY: p_token.borrowRateAPY,
      supplyAPY: p_token.supplyRateAPY,
    }))
  );

  const totalCollateralWithLiquidationThreshold = userBalances.reduce(
    (acc, { metrics, e_mode, p_token, user_balance }) => {
      if (!user_balance.isCollateral) return acc;

      const liquidationThreshold = e_mode
        ? e_mode.liquidationThreshold
        : p_token.liquidationThreshold;

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
    pTokenMetrics: userBalances.map(({ metrics, p_token }) => ({
      ...metrics,
      pTokenId: p_token.id,
    })),
  };
}
