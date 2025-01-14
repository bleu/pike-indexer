import { Context, Event } from 'ponder:registry';

export function getEventId(event: Event) {
  return `${event.transaction.hash}-${event.log.id}`;
}

export function getAddressId(chainId: number, address: string) {
  return `${address}-${chainId}`;
}

export function getTransactionId(event: Event, context: Context) {
  return `${event.transaction.hash}-${context.network.chainId}`;
}

export function getUserBalanceId(userId: string, pTokenId: string) {
  const userAddress = userId.split('-')[0];
  return `${userAddress}-${pTokenId}`;
}

export function getUserDelegationId(userId: string, delegate: string) {
  const userAddress = userId.split('-')[0];
  const chainId = userId.split('-')[1];
  return `${userAddress}-${delegate}-${chainId}`;
}
