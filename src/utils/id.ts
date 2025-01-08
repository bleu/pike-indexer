import { Context, Event } from 'ponder:registry';

export function getUniqueEventId(event: Event) {
  return `${event.transaction.hash}-${event.log.id}`;
}

export function getUniqueAddressId(chainId: number, address: string) {
  return `${address}-${chainId}`;
}

export function getTransactionId(event: Event, context: Context) {
  return `${event.transaction.hash}-${context.network.chainId}`;
}
