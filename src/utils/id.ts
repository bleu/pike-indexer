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

export function getUserDelegationId(userId: string, delegate: string) {
  const userAddress = userId.split('-')[0];
  const chainId = userId.split('-')[1];
  return `${userAddress}-${delegate}-${chainId}`;
}

export function getEModeId(protocolId: string, categoryId: number) {
  const protocolAddress = protocolId.split('-')[0];
  const chainId = protocolId.split('-')[1];
  return `${protocolAddress}-${categoryId}-${chainId}`;
}

export function getPTokenEModeId(pTokenId: string, eModeId: string) {
  const pTokenAddress = pTokenId.split('-')[0];
  return `${pTokenAddress}-${eModeId}`;
}

export function getUserEModeId(userId: string, eModeId: string) {
  const userAddress = userId.split('-')[0];
  return `${userAddress}-${eModeId}`;
}
