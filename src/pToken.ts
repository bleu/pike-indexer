import { ponder } from 'ponder:registry';
import {
  getTransactionId,
  getUniqueAddressId,
  getUniqueEventId,
} from './utils/id';
import { deposit, pToken } from 'ponder:schema';
import { getOrCreateTransaction } from './utils/transaction';
import { getOrCreateUser } from './utils/user';

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

  const onBehalfOfId = getUniqueAddressId(
    context.network.chainId,
    event.args.owner
  );

  await Promise.all([
    getOrCreateTransaction(event, context),
    getOrCreateUser(context, event.args.owner),
    context.db.insert(deposit).values({
      id: depositId,
      transactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      pTokenId,
      onBehalfOfId,
      minter: event.args.sender,
      ...event.args,
    }),
  ]);
});
