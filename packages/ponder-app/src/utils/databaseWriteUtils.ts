import { Context } from 'ponder:registry';
import {
  transaction,
  underlyingToken,
  userDelegation,
  pTokenEMode,
  user,
} from 'ponder:schema';
import { getTransactionId, getAddressId, getUserBalanceId } from './id';
import { ContractEvent, InsertOrUpdateUserBalanceParams } from './types';
import { Address } from 'viem';
import { readErc20Information } from './multicalls';
import { pToken, userBalance } from 'ponder:schema';
import { currentRatePerSecondToAPY, DoubleJumpRateModel } from '@pike/utils';

export async function createIfNotExistsTransaction(
  event: ContractEvent,
  context: Context
) {
  const txId = getTransactionId(event, context);
  const tx = await context.db
    .insert(transaction)
    .values({
      id: txId,
      chainId: BigInt(context.network.chainId),
      transactionHash: event.transaction.hash,
      timestamp: event.block.timestamp,
      blockNumber: event.block.number,
      blockHash: event.block.hash,
      from: event.transaction.from,
      to: event.transaction.to,
      gas: event.transaction.gas,
      gasPrice: event.transaction.gasPrice,
    })
    .onConflictDoNothing();

  return tx;
}

export async function createIfNotExistsUnderlying(
  address: Address,
  context: Context
) {
  const underlyingId = getAddressId(context.network.chainId, address);

  const underlying = await context.db.find(underlyingToken, {
    id: underlyingId,
  });

  if (underlying) {
    return underlying;
  }

  const underlyingErc20Data = await readErc20Information(context, address);

  const underlyingValue = {
    id: underlyingId,
    chainId: BigInt(context.network.chainId),
    address,
    name: underlyingErc20Data.name,
    symbol: underlyingErc20Data.symbol,
    decimals: underlyingErc20Data.decimals.toString(),
  };

  return await context.db
    .insert(underlyingToken)
    .values(underlyingValue)
    .onConflictDoUpdate(underlyingValue);
}

export function createOrDeleteDelegation(
  context: Context,
  params: typeof userDelegation.$inferSelect,
  approved: boolean
) {
  if (approved) {
    return context.db
      .insert(userDelegation)
      .values(params)
      .onConflictDoNothing();
  }
  return context.db.delete(userDelegation, { id: params.id });
}

export function upsertOrDeletePTokenEMode(
  context: Context,
  params: typeof pTokenEMode.$inferSelect
) {
  if (params.borrowEnabled || params.collateralEnabled) {
    return context.db
      .insert(pTokenEMode)
      .values(params)
      .onConflictDoUpdate(params);
  }

  // delete the entry if both borrow and deposit are disabled
  return context.db.delete(pTokenEMode, { id: params.id }).catch(e => {
    console.warn('Error deleting pTokenEMode', e);
  });
}

export async function createIfNotExistsUser(
  context: Context,
  address: Address
) {
  const chainId = context.network.chainId;
  const userId = getAddressId(chainId, address);
  return await context.db
    .insert(user)
    .values({
      id: userId,
      chainId: BigInt(context.network.chainId),
      address,
    })
    .onConflictDoNothing();
}

export async function insertOrUpdateUserBalance(
  context: Context,
  event: ContractEvent,
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

  const updatedAt = event.block.timestamp;

  const userBalanceId = getUserBalanceId(params.userId, params.pTokenId);
  return await context.db
    .insert(userBalance)
    .values({
      id: userBalanceId,
      supplyShares: params.supplySharesAdded,
      interestIndex: borrowIndex,
      updatedAt,
      ...params,
    })
    .onConflictDoUpdate(
      ({ supplyShares, borrowAssets, isCollateral, interestIndex }) => ({
        updatedAt,
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

export async function updatePTokenWithRates(
  context: Context,
  event: ContractEvent,
  pTokenId: string,
  pTokenUpdater: (
    params: typeof pToken.$inferSelect
  ) => typeof pToken.$inferSelect
) {
  return await context.db.update(pToken, { id: pTokenId }).set(params => {
    const newPTokenParams = pTokenUpdater(params);

    const rateModel = new DoubleJumpRateModel(newPTokenParams);

    const utilization = rateModel.getUtilization();
    const borrowRatePerSecond = rateModel.getBorrowRate();
    const supplyRatePerSecond = rateModel.getSupplyRate();

    return {
      ...newPTokenParams,
      borrowRatePerSecond,
      supplyRatePerSecond,
      supplyRateAPY: currentRatePerSecondToAPY(supplyRatePerSecond),
      borrowRateAPY: currentRatePerSecondToAPY(borrowRatePerSecond),
      utilization,
      updatedAt: event.block.timestamp,
    };
  });
}
