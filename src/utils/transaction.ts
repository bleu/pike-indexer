import { Context, Event } from 'ponder:registry';
import { transaction } from 'ponder:schema';
import { getTransactionId } from './id';

export async function getOrCreateTransaction(event: Event, context: Context) {
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
