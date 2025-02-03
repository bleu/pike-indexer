import { Virtual } from 'ponder';
import { config, EventNames } from 'ponder:registry';
import {
  eMode,
  pToken,
  pTokenEMode,
  userBalance,
  userEMode,
} from 'ponder:schema';

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type BlockEventNames =
  | 'CurrentPriceUpdate:block'
  | 'PriceSnapshotUpdate:block'
  | 'APRSnapshotUpdate:block';

export type ContractEventsName = Exclude<EventNames, BlockEventNames>;

export type ContractEvent<
  name extends ContractEventsName = ContractEventsName,
> = Virtual.Event<config['default'], name>;

export type InsertOrUpdateUserBalanceParams = Omit<
  Optional<
    typeof userBalance.$inferSelect,
    'borrowAssets' | 'isCollateral' | 'interestIndex'
  >,
  'id' | 'supplyShares' | 'updatedAt'
> & {
  supplySharesAdded?: bigint;
  supplySharesRemoved?: bigint;
};

export interface UserProtocolPTokenQueryResult {
  userBalance: typeof userBalance.$inferSelect;
  pToken: typeof pToken.$inferSelect;
  eMode: typeof eMode.$inferSelect | null;
  userEMode: typeof userEMode.$inferSelect | null;
  pTokenEMode: typeof pTokenEMode.$inferSelect | null;
}
