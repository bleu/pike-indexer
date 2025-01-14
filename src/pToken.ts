import { ponder } from 'ponder:registry';
import {
  getTransactionId,
  getUniqueAddressId,
  getUniqueEventId,
} from './utils/id';
import {
  borrow,
  deposit,
  pToken,
  repayBorrow,
  transfer,
  withdraw,
} from 'ponder:schema';
import { getOrCreateTransaction } from './utils/transaction';
import { getOrCreateUser } from './utils/user';
import { zeroAddress } from 'viem';

ponder.on('PToken:NewRiskEngine', async ({ context, event }) => {
  await context.db
    .update(pToken, {
      id: getUniqueAddressId(context.network.chainId, event.log.address),
    })
    .set({
      protocolId: getUniqueAddressId(
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
      id: getUniqueAddressId(context.network.chainId, event.log.address),
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
      id: getUniqueAddressId(context.network.chainId, event.log.address),
    })
    .set({
      protocolSeizeShare: event.args.newProtocolSeizeShareMantissa,
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('PToken:Deposit', async ({ context, event }) => {
  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  const depositId = getUniqueEventId(event);

  const userId = getUniqueAddressId(context.network.chainId, event.args.owner);

  await Promise.all([
    getOrCreateTransaction(event, context),
    getOrCreateUser(context, event.args.owner),
    context.db
      .update(pToken, { id: pTokenId })
      .set(({ cash, totalSupply }) => ({
        cash: cash + event.args.assets,
        totalSupply: totalSupply + event.args.shares,
      })),
    context.db.insert(deposit).values({
      id: depositId,
      transactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      pTokenId,
      userId,
      minter: event.args.sender,
      ...event.args,
    }),
  ]);
});

ponder.on('PToken:Withdraw', async ({ context, event }) => {
  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  const depositId = getUniqueEventId(event);

  const userId = getUniqueAddressId(context.network.chainId, event.args.owner);

  await Promise.all([
    getOrCreateTransaction(event, context),
    context.db
      .update(pToken, { id: pTokenId })
      .set(({ cash, totalSupply }) => ({
        cash: cash - event.args.assets,
        totalSupply: totalSupply - event.args.shares,
      })),
    context.db.insert(withdraw).values({
      id: depositId,
      transactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      pTokenId,
      userId,
      ...event.args,
    }),
  ]);
});

ponder.on('PToken:RepayBorrow', async ({ context, event }) => {
  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  const depositId = getUniqueEventId(event);

  const userId = getUniqueAddressId(
    context.network.chainId,
    event.args.onBehalfOf
  );

  await Promise.all([
    getOrCreateTransaction(event, context),
    context.db.update(pToken, { id: pTokenId }).set(({ cash }) => ({
      totalBorrows: event.args.totalBorrows,
      cash: cash + event.args.repayAmount,
    })),
    context.db.insert(repayBorrow).values({
      id: depositId,
      transactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      pTokenId,
      userId,
      repayAssets: event.args.repayAmount,
      ...event.args,
    }),
  ]);
});

ponder.on('PToken:Borrow', async ({ context, event }) => {
  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  const depositId = getUniqueEventId(event);

  const userId = getUniqueAddressId(
    context.network.chainId,
    event.args.borrower
  );

  await Promise.all([
    getOrCreateTransaction(event, context),
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
  ]);
});

ponder.on('PToken:Transfer', async ({ context, event }) => {
  if (event.args.from === zeroAddress || event.args.to === zeroAddress) {
    // Ignore mint and burn events
    return;
  }

  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  const depositId = getUniqueEventId(event);

  const fromId = getUniqueAddressId(context.network.chainId, event.args.from);

  const toId = getUniqueAddressId(context.network.chainId, event.args.to);

  await Promise.all([
    getOrCreateTransaction(event, context),
    getOrCreateUser(context, event.args.to),
    context.db.insert(transfer).values({
      id: depositId,
      transactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      pTokenId,
      fromId,
      toId,
      shares: event.args.value,
    }),
  ]);
});

ponder.on('PToken:AccrueInterest', async ({ context, event }) => {
  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  await context.db.update(pToken, { id: pTokenId }).set({
    cash: event.args.cashPrior,
    borrowIndex: event.args.borrowIndex,
    totalBorrows: event.args.totalBorrows,
    totalReserves: event.args.totalReserves,
  });
});

ponder.on('PToken:ReservesAdded', async ({ context, event }) => {
  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  await context.db.update(pToken, { id: pTokenId }).set({
    totalReserves: event.args.newTotalReserves,
  });
});

ponder.on('PToken:ReservesReduced', async ({ context, event }) => {
  const pTokenId = getUniqueAddressId(
    context.network.chainId,
    event.log.address
  );

  await context.db.update(pToken, { id: pTokenId }).set({
    totalReserves: event.args.newTotalReserves,
  });
});
