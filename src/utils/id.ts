import { Context, Event } from "ponder:registry";

export function getUniqueEventId(event: Event) {
  return `${event.transaction.hash}-${event.log.id}`;
}

export function getUniqueContractId(chainId: number, address: string) {
  return `${address}-${chainId}`;
}

export function getProtocolId(
  factoryAddress: string,
  chainId: number,
  protocolId: bigint
) {
  return `${factoryAddress}-${protocolId}-${chainId}`;
}

export function getTxId(event: Event, context: Context) {
  return `${event.transaction.hash}-${context.network.chainId}`;
}
