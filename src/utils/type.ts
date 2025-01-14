import { Virtual } from 'ponder';
import { config, EventNames } from 'ponder:registry';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type BlockEventNames =
  | 'CurrentPriceUpdate:block'
  | 'PriceSnapshotUpdate:block'
  | 'APRSnapshotUpdate:block';

export type ContractEventsName = Exclude<EventNames, BlockEventNames>;

export type ContractEvent<
  name extends ContractEventsName = ContractEventsName,
> = Virtual.Event<config['default'], name>;
