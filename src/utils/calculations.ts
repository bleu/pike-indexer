import { pToken, userBalance } from 'ponder:schema';
import { MathSol } from './math';
import { formatEther } from 'viem';

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
