import { Context, Event } from "ponder:registry";
import { transaction } from "ponder:schema";

export async function getOrCreateTx(event: Event, context: Context) {
  const txId = getTxId(event, context);
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

export function getTxId(event: Event, context: Context) {
  return `${event.transaction.hash}-${context.network.chainId}`;
}
