import { ponder } from 'ponder:registry';
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

ponder.on('PToken:NewRiskEngine', async ({ context, event }) => {
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
});

ponder.on('PToken:NewReserveFactor', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);
  await updatePTokenWithRates(context, event, pTokenId, params => ({
    ...params,
    newReserveFactorMantissa: event.args.newReserveFactorMantissa,
  })).catch(error => {
    console.error(error.message);
  });
});

ponder.on('PToken:NewProtocolSeizeShare', async ({ context, event }) => {
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
});

ponder.on('PToken:Deposit', async ({ context, event }) => {
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
});

ponder.on('PToken:Withdraw', async ({ context, event }) => {
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
});

ponder.on('PToken:RepayBorrow', async ({ context, event }) => {
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
});

ponder.on('PToken:Borrow', async ({ context, event }) => {
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
});

ponder.on('PToken:Transfer', async ({ context, event }) => {
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
});

ponder.on('PToken:AccrueInterest', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  await updatePTokenWithRates(context, event, pTokenId, params => ({
    ...params,
    cash: event.args.cashPrior,
    borrowIndex: event.args.borrowIndex,
    totalBorrows: event.args.totalBorrows,
    totalReserves: event.args.totalReserves,
  }));
});

ponder.on('PToken:ReservesAdded', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  await updatePTokenWithRates(context, event, pTokenId, params => ({
    ...params,
    totalReserves: event.args.newTotalReserves,
  }));
});

ponder.on('PToken:ReservesReduced', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  await updatePTokenWithRates(context, event, pTokenId, params => ({
    ...params,
    totalReserves: event.args.newTotalReserves,
  }));
});

ponder.on('PToken:LiquidateBorrow', async ({ context, event }) => {
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
});

ponder.on('PToken:NewInterestParams', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  await updatePTokenWithRates(context, event, pTokenId, params => ({
    ...params,
    ...event.args,
  })).catch(error => {
    console.error(error.message);
  });
});
