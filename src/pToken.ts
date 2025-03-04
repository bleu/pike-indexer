import { Context, Event } from 'ponder:registry';
import { getTransactionId, getAddressId, getEventId } from './utils/id';
import {
  borrow,
  deposit,
  liquidateBorrow,
  pToken,
  repayBorrow,
  transfer,
  withdraw,
} from 'ponder:schema';
import { formatEther, parseEther, zeroAddress } from 'viem';
import {
  calculateUsdValueFromAssets,
  calculateUsdValueFromShares,
} from './utils/calculations';
import {
  createIfNotExistsTransaction,
  createIfNotExistsUser,
  insertOrUpdateUserBalance,
  updatePTokenWithRates,
} from './utils/databaseWriteUtils';
import { registerEvent } from './utils/eventRegister';

registerEvent(
  'PToken:NewRiskEngine',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:NewRiskEngine'>;
  }) => {
    // This new riskEngine should be first emitted by the Factory
    // to be indexed on the tracking settings and the protocol created
    await context.db
      .update(pToken, {
        id: getAddressId(context.network.chainId, event.log.address),
      })
      .set({
        protocolId: getAddressId(
          context.network.chainId,
          event.args.newRiskEngine
        ),
        updatedAt: event.block.timestamp,
      })
      .catch(error => {
        console.error(error.message);
      });
  }
);

registerEvent(
  'PToken:NewReserveFactor',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:NewReserveFactor'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);
    await updatePTokenWithRates(context, event, pTokenId, params => ({
      ...params,
      newReserveFactorMantissa: event.args.newReserveFactorMantissa,
    })).catch(error => {
      console.error(error.message);
    });
  }
);

registerEvent(
  'PToken:NewProtocolSeizeShare',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:NewProtocolSeizeShare'>;
  }) => {
    await context.db
      .update(pToken, {
        id: getAddressId(context.network.chainId, event.log.address),
      })
      .set({
        updatedAt: event.block.timestamp,
        protocolSeizeShare: event.args.newProtocolSeizeShareMantissa,
      })
      .catch(error => {
        console.error(error.message);
      });
  }
);

registerEvent(
  'PToken:Deposit',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:Deposit'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    const depositId = getEventId(event);

    const userId = event.args.owner;

    const chainId = BigInt(context.network.chainId);

    const underlyingPrice = await context.db
      .find(pToken, { id: pTokenId })
      .then(pTokenData => {
        if (!pTokenData) {
          console.error('PToken not found', pTokenId);
          return BigInt(0);
        }

        return pTokenData.underlyingPriceCurrent;
      });

    const usdValue = calculateUsdValueFromAssets(
      event.args.assets,
      underlyingPrice
    );

    await Promise.all([
      createIfNotExistsTransaction(event, context),
      createIfNotExistsUser(context, event.args.owner),
      updatePTokenWithRates(context, event, pTokenId, params => ({
        ...params,
        cash: params.cash + event.args.assets,
        totalSupply: params.totalSupply + event.args.shares,
        totalSupplyUsdValue: formatEther(
          parseEther(params.totalSupplyUsdValue) + parseEther(usdValue)
        ),
      })),

      insertOrUpdateUserBalance(context, event, {
        userId,
        pTokenId,
        supplySharesAdded: event.args.shares,
        chainId,
      }),
      context.db.insert(deposit).values({
        id: depositId,
        transactionId: getTransactionId(event, context),
        chainId,
        pTokenId,
        userId,
        usdValue,
        minter: event.args.sender,
        ...event.args,
      }),
    ]);
  }
);

registerEvent(
  'PToken:Withdraw',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:Withdraw'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    const depositId = getEventId(event);

    const userId = event.args.owner;

    const chainId = BigInt(context.network.chainId);

    const underlyingPrice = await context.db
      .find(pToken, { id: pTokenId })
      .then(pTokenData => {
        if (!pTokenData) {
          console.error('PToken not found', pTokenId);
          return BigInt(0);
        }

        return pTokenData.underlyingPriceCurrent;
      });

    const usdValue = calculateUsdValueFromAssets(
      event.args.assets,
      underlyingPrice
    );

    await Promise.all([
      createIfNotExistsTransaction(event, context),
      await updatePTokenWithRates(context, event, pTokenId, params => ({
        ...params,
        cash: params.cash - event.args.assets,
        totalSupply: params.totalSupply - event.args.shares,
        totalBorrowUsdValue: formatEther(
          parseEther(params.totalSupplyUsdValue) - parseEther(usdValue)
        ),
      })),
      insertOrUpdateUserBalance(context, event, {
        userId,
        pTokenId,
        supplySharesRemoved: event.args.shares,
        chainId,
      }),
      context.db.insert(withdraw).values({
        id: depositId,
        transactionId: getTransactionId(event, context),
        chainId,
        pTokenId,
        userId,
        usdValue,
        ...event.args,
      }),
    ]);
  }
);

registerEvent(
  'PToken:RepayBorrow',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:RepayBorrow'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    const depositId = getEventId(event);

    const userId = event.args.onBehalfOf;

    const chainId = BigInt(context.network.chainId);

    const underlyingPrice = await context.db
      .find(pToken, { id: pTokenId })
      .then(pTokenData => {
        if (!pTokenData) {
          console.error('PToken not found', pTokenId);
          return BigInt(0);
        }

        return pTokenData.underlyingPriceCurrent;
      });

    const usdValue = calculateUsdValueFromAssets(
      event.args.repayAmount,
      underlyingPrice
    );

    const totalBorrowUsdValue = calculateUsdValueFromAssets(
      event.args.totalBorrows,
      underlyingPrice
    );

    await Promise.all([
      createIfNotExistsTransaction(event, context),
      updatePTokenWithRates(context, event, pTokenId, params => ({
        ...params,
        totalBorrows: event.args.totalBorrows,
        cash: params.cash + event.args.repayAmount,
        totalBorrowUsdValue,
      })),
      context.db.insert(repayBorrow).values({
        id: depositId,
        transactionId: getTransactionId(event, context),
        chainId,
        pTokenId,
        userId,
        repayAssets: event.args.repayAmount,
        usdValue,
        ...event.args,
      }),
      insertOrUpdateUserBalance(context, event, {
        userId,
        pTokenId,
        borrowAssets: event.args.accountBorrows,
        chainId,
      }),
    ]);
  }
);

registerEvent(
  'PToken:Borrow',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:Borrow'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    const depositId = getEventId(event);
    const userId = event.args.borrower;

    const chainId = BigInt(context.network.chainId);

    const underlyingPrice = await context.db
      .find(pToken, { id: pTokenId })
      .then(pTokenData => {
        if (!pTokenData) {
          console.error('PToken not found', pTokenId);
          return BigInt(0);
        }

        return pTokenData.underlyingPriceCurrent;
      });

    const usdValue = calculateUsdValueFromAssets(
      event.args.borrowAmount,
      underlyingPrice
    );

    const totalBorrowUsdValue = calculateUsdValueFromAssets(
      event.args.totalBorrows,
      underlyingPrice
    );

    await Promise.all([
      createIfNotExistsTransaction(event, context),
      updatePTokenWithRates(context, event, pTokenId, params => ({
        ...params,
        totalBorrows: event.args.totalBorrows,
        cash: params.cash - event.args.borrowAmount,
        totalBorrowUsdValue,
      })),
      context.db.insert(borrow).values({
        id: depositId,
        transactionId: getTransactionId(event, context),
        chainId: BigInt(context.network.chainId),
        pTokenId,
        userId,
        borrowAssets: event.args.borrowAmount,
        usdValue,
        ...event.args,
      }),
      insertOrUpdateUserBalance(context, event, {
        userId,
        pTokenId,
        borrowAssets: event.args.accountBorrows,
        chainId,
      }),
    ]);
  }
);

registerEvent(
  'PToken:Transfer',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:Transfer'>;
  }) => {
    if (event.args.from === zeroAddress || event.args.to === zeroAddress) {
      // Ignore mint and burn events
      return;
    }

    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    const depositId = getEventId(event);

    const fromId = event.args.from;

    const toId = event.args.to;

    const pTokenData = await context.db.find(pToken, { id: pTokenId });

    if (!pTokenData) {
      console.error('PToken not found', pTokenId);
      return;
    }

    const usdValue = calculateUsdValueFromShares(
      event.args.value,
      pTokenData.exchangeRateStored,
      pTokenData.underlyingPriceCurrent
    );

    await Promise.all([
      createIfNotExistsTransaction(event, context),
      createIfNotExistsUser(context, event.args.to),
      context.db.insert(transfer).values({
        id: depositId,
        transactionId: getTransactionId(event, context),
        chainId: BigInt(context.network.chainId),
        pTokenId,
        fromId,
        toId,
        shares: event.args.value,
        usdValue,
      }),
      insertOrUpdateUserBalance(context, event, {
        userId: fromId,
        pTokenId,
        supplySharesRemoved: event.args.value,
        chainId: BigInt(context.network.chainId),
      }),
      insertOrUpdateUserBalance(context, event, {
        userId: toId,
        pTokenId,
        supplySharesAdded: event.args.value,
        chainId: BigInt(context.network.chainId),
      }),
    ]);
  }
);

registerEvent(
  'PToken:AccrueInterest',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:AccrueInterest'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    await updatePTokenWithRates(context, event, pTokenId, params => ({
      ...params,
      cash: event.args.cashPrior,
      borrowIndex: event.args.borrowIndex,
      totalBorrows: event.args.totalBorrows,
      totalReserves: event.args.totalReserves,
    }));
  }
);

registerEvent(
  'PToken:ReservesAdded',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:ReservesAdded'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    await updatePTokenWithRates(context, event, pTokenId, params => ({
      ...params,
      totalReserves: event.args.newTotalReserves,
    }));
  }
);

registerEvent(
  'PToken:ReservesReduced',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:ReservesReduced'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    await updatePTokenWithRates(context, event, pTokenId, params => ({
      ...params,
      totalReserves: event.args.newTotalReserves,
    }));
  }
);

registerEvent(
  'PToken:LiquidateBorrow',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:LiquidateBorrow'>;
  }) => {
    const borrowPTokenId = getAddressId(
      context.network.chainId,
      event.log.address
    );

    const collateralPTokenId = getAddressId(
      context.network.chainId,
      event.args.pTokenCollateral
    );

    const liquidationId = getEventId(event);

    const liquidatorId = event.args.liquidator;

    const [collateralPTokenData, borrowPTokenData] = await Promise.all([
      context.db.find(pToken, {
        id: collateralPTokenId,
      }),
      context.db.find(pToken, {
        id: borrowPTokenId,
      }),
    ]);

    const borrowUnderlyingPrice =
      borrowPTokenData?.underlyingPriceCurrent || BigInt(0);

    const collateralUnderlyingPrice =
      collateralPTokenData?.underlyingPriceCurrent || BigInt(0);

    const borrowerId = event.args.borrower;

    const seizeUsdValue = calculateUsdValueFromShares(
      event.args.seizeTokens,
      collateralPTokenData?.exchangeRateStored || BigInt(0),
      collateralUnderlyingPrice
    );

    const repayUsdValue = calculateUsdValueFromAssets(
      event.args.repayAmount,
      borrowUnderlyingPrice
    );

    // we don't need to update the pTokens because the liquidation call also emits the
    // repay, transfer, accrueInterest, etc events.
    await Promise.all([
      createIfNotExistsTransaction(event, context),
      createIfNotExistsUser(context, event.args.liquidator),
      context.db.insert(liquidateBorrow).values({
        id: liquidationId,
        transactionId: getTransactionId(event, context),
        chainId: BigInt(context.network.chainId),
        borrowPTokenId,
        collateralPTokenId,
        borrowerId,
        liquidatorId,
        repayAssets: event.args.repayAmount,
        seizeShares: event.args.seizeTokens,
        repayUsdValue,
        seizeUsdValue,
      }),
    ]);
  }
);

registerEvent(
  'PToken:NewInterestParams',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PToken:NewInterestParams'>;
  }) => {
    const pTokenId = getAddressId(context.network.chainId, event.log.address);

    await updatePTokenWithRates(context, event, pTokenId, params => ({
      ...params,
      ...event.args,
    })).catch(error => {
      console.error(error.message);
    });
  }
);
