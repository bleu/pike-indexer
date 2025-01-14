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
import { createIfNotExistsTransaction } from './utils/transaction';
import { createIfNotExistsUser } from './utils/user';
import { zeroAddress } from 'viem';
import { insertOrUpdateUserBalance } from './utils/userBalance';

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
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('PToken:NewReserveFactor', async ({ context, event }) => {
  await context.db
    .update(pToken, {
      id: getAddressId(context.network.chainId, event.log.address),
    })
    .set({
      reserveFactor: event.args.newReserveFactorMantissa,
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('PToken:NewProtocolSeizeShare', async ({ context, event }) => {
  await context.db
    .update(pToken, {
      id: getAddressId(context.network.chainId, event.log.address),
    })
    .set({
      protocolSeizeShare: event.args.newProtocolSeizeShareMantissa,
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('PToken:Deposit', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  const depositId = getEventId(event);

  const userId = getAddressId(context.network.chainId, event.args.owner);

  const chainId = BigInt(context.network.chainId);

  await Promise.all([
    createIfNotExistsTransaction(event, context),
    createIfNotExistsUser(context, event.args.owner),
    context.db
      .update(pToken, { id: pTokenId })
      .set(({ cash, totalSupply }) => ({
        cash: cash + event.args.assets,
        totalSupply: totalSupply + event.args.shares,
      })),
    insertOrUpdateUserBalance(context, {
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
      minter: event.args.sender,
      ...event.args,
    }),
  ]);
});

ponder.on('PToken:Withdraw', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  const depositId = getEventId(event);

  const userId = getAddressId(context.network.chainId, event.args.owner);

  const chainId = BigInt(context.network.chainId);

  await Promise.all([
    createIfNotExistsTransaction(event, context),
    context.db
      .update(pToken, { id: pTokenId })
      .set(({ cash, totalSupply }) => ({
        cash: cash - event.args.assets,
        totalSupply: totalSupply - event.args.shares,
      })),
    insertOrUpdateUserBalance(context, {
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
      ...event.args,
    }),
  ]);
});

ponder.on('PToken:RepayBorrow', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  const depositId = getEventId(event);

  const userId = getAddressId(context.network.chainId, event.args.onBehalfOf);

  const chainId = BigInt(context.network.chainId);

  await Promise.all([
    createIfNotExistsTransaction(event, context),
    context.db.update(pToken, { id: pTokenId }).set(({ cash }) => ({
      totalBorrows: event.args.totalBorrows,
      cash: cash + event.args.repayAmount,
    })),
    context.db.insert(repayBorrow).values({
      id: depositId,
      transactionId: getTransactionId(event, context),
      chainId,
      pTokenId,
      userId,
      repayAssets: event.args.repayAmount,
      ...event.args,
    }),
    insertOrUpdateUserBalance(context, {
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

  const userId = getAddressId(context.network.chainId, event.args.borrower);

  const chainId = BigInt(context.network.chainId);

  await Promise.all([
    createIfNotExistsTransaction(event, context),
    context.db.update(pToken, { id: pTokenId }).set(({ cash }) => ({
      totalBorrows: event.args.totalBorrows,
      cash: cash - event.args.borrowAmount,
    })),
    context.db.insert(borrow).values({
      id: depositId,
      transactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      pTokenId,
      userId,
      borrowAssets: event.args.borrowAmount,
      ...event.args,
    }),
    insertOrUpdateUserBalance(context, {
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

  const fromId = getAddressId(context.network.chainId, event.args.from);

  const toId = getAddressId(context.network.chainId, event.args.to);

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
    }),
    insertOrUpdateUserBalance(context, {
      userId: fromId,
      pTokenId,
      supplySharesRemoved: event.args.value,
      chainId: BigInt(context.network.chainId),
    }),
    insertOrUpdateUserBalance(context, {
      userId: toId,
      pTokenId,
      supplySharesAdded: event.args.value,
      chainId: BigInt(context.network.chainId),
    }),
  ]);
});

ponder.on('PToken:AccrueInterest', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  await context.db.update(pToken, { id: pTokenId }).set({
    cash: event.args.cashPrior,
    borrowIndex: event.args.borrowIndex,
    totalBorrows: event.args.totalBorrows,
    totalReserves: event.args.totalReserves,
  });
});

ponder.on('PToken:ReservesAdded', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  await context.db.update(pToken, { id: pTokenId }).set({
    totalReserves: event.args.newTotalReserves,
  });
});

ponder.on('PToken:ReservesReduced', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.log.address);

  await context.db.update(pToken, { id: pTokenId }).set({
    totalReserves: event.args.newTotalReserves,
  });
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

  const liquidatorId = getAddressId(
    context.network.chainId,
    event.args.liquidator
  );

  const borrowerId = getAddressId(context.network.chainId, event.args.borrower);

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
    }),
  ]);
});
