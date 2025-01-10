import { Virtual } from 'ponder';
import { config, EventNames } from 'ponder:registry';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type ContractEvents = Exclude<EventNames, 'CurrentPriceUpdate:block'>;

export type ContractEvent<name extends ContractEvents = ContractEvents> =
  Virtual.Event<config['default'], name>;
