import { Context } from 'ponder:registry';
import { pToken, userBalance } from 'ponder:schema';
import { Optional } from './type';
import { getUserBalanceId } from './id';

export type InsertOrUpdateUserBalanceParams = Omit<
  Optional<
    typeof userBalance.$inferSelect,
    'borrowAssets' | 'isCollateral' | 'interestIndex'
  >,
  'id' | 'supplyShares'
> & {
  supplySharesAdded?: bigint;
  supplySharesRemoved?: bigint;
};

export async function insertOrUpdateUserBalance(
  context: Context,
  params: InsertOrUpdateUserBalanceParams
) {
  /**
   * Asset Updates Logic:
   *
   * For Creation:
   * - supplySharesAdded becomes the initial supplyAssets value
   *
   * For Updates:
   * - supplyAssets is modified by:
   *   • Adding supplyAssetsAdded
   *   • Subtracting supplySharesRemoved
   * - borrowAssets and isCollateral are directly set to their new values
   */

  let borrowIndex: bigint | undefined;

  if (params.borrowAssets) {
    const pTokenData = await context.db.find(pToken, { id: params.pTokenId });
    borrowIndex = pTokenData?.borrowIndex;
  }

  const userBalanceId = getUserBalanceId(params.userId, params.pTokenId);
  return await context.db
    .insert(userBalance)
    .values({
      id: userBalanceId,
      supplyShares: params.supplySharesAdded,
      ...params,
    })
    .onConflictDoUpdate(
      ({ supplyShares, borrowAssets, isCollateral, interestIndex }) => ({
        supplyShares:
          supplyShares +
          (params.supplySharesAdded ?? 0n) -
          (params.supplySharesRemoved ?? 0n),
        borrowAssets: params.borrowAssets ?? borrowAssets,
        interestIndex: borrowIndex ?? interestIndex,
        isCollateral:
          params.isCollateral === undefined
            ? isCollateral
            : params.isCollateral,
      })
    );
}
