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
  user_balance: typeof userBalance.$inferSelect;
  p_token: typeof pToken.$inferSelect;
  e_mode: typeof eMode.$inferSelect | null;
  user_e_mode: typeof userEMode.$inferSelect | null;
  p_token_e_mode: typeof pTokenEMode.$inferSelect | null;
}
