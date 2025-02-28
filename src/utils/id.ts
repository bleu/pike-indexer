import { Context } from 'ponder:registry';
import { ContractEvent } from './types';

export function getEventId(event: ContractEvent) {
  return `${event.transaction.hash}-${event.log.id}`;
}

export function getAddressId(chainId: number, address: string) {
  return `${address}-${chainId}`;
}

export function getTransactionId(event: ContractEvent, context: Context) {
  return `${event.transaction.hash}-${context.network.chainId}`;
}

export function getUserBalanceId(userAddress: string, pTokenId: string) {
  return `${userAddress}-${pTokenId}`;
}

export function getUserDelegationId(
  userAddress: string,
  delegate: string,
  chainId: number
) {
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

export function getUserEModeId(userAddress: string, protocolId: string) {
  // With that we only saves the current eMode for each protocol
  return `${userAddress}-${protocolId}`;
}
