import { Event } from "ponder:registry";

export function getUniqueEventId(event: Event) {
  return `${event.transaction.hash}-${event.log.id}`;
}

export function getUniqueContractId(chainId: number, address: string) {
  return `${address}-${chainId}`;
}
