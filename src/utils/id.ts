import { Context, Event } from 'ponder:registry';
import { ContractEvent } from './type';

export function getEventId(event: ContractEvent) {
  return `${event.transaction.hash}-${event.log.id}`;
}

export function getAddressId(chainId: number, address: string) {
  return `${address}-${chainId}`;
}

export function getTransactionId(event: ContractEvent, context: Context) {
  return `${event.transaction.hash}-${context.network.chainId}`;
}

export function getUserBalanceId(userId: string, pTokenId: string) {
  const userAddress = userId.split('-')[0];
  return `${userAddress}-${pTokenId}`;
}
