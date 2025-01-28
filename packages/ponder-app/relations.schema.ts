import { relations } from 'ponder';
import {
  actionPaused,
  beaconProxy,
  borrow,
  delegateUpdated,
  deposit,
  eMode,
  liquidateBorrow,
  marketEntered,
  marketExited,
  priceSnapshot,
  protocol,
  pToken,
  pTokenEMode,
  repayBorrow,
  transaction,
  transfer,
  underlyingToken,
  user,
  userBalance,
  userDelegation,
  userEMode,
  withdraw,
} from './tables.schema';

export const beaconProxyRelations = relations(beaconProxy, ({ many }) => ({
  protocols: many(protocol),
}));

export const protocolRelations = relations(protocol, ({ one, many }) => ({
  creationTransaction: one(transaction, {
    fields: [protocol.creationTransactionId],
    references: [transaction.id],
  }),
  actionsPaused: many(actionPaused),
  pTokens: many(pToken),
  delegatesUpdated: many(delegateUpdated),
  delegates: many(userDelegation),
  eModes: many(eMode),
  initOracleEngineBeaconProxy: one(beaconProxy, {
    fields: [protocol.initOracleEngineBeaconProxyId],
    references: [beaconProxy.id],
  }),
  pTokenBeaconProxy: one(beaconProxy, {
    fields: [protocol.pTokenBeaconProxyId],
    references: [beaconProxy.id],
  }),
  timelockBeaconProxy: one(beaconProxy, {
    fields: [protocol.timelockBeaconProxyId],
    references: [beaconProxy.id],
  }),

  riskEngineBeaconProxy: one(beaconProxy, {
    fields: [protocol.riskEngineBeaconProxyId],
    references: [beaconProxy.id],
  }),
}));

export const actionPausedRelations = relations(actionPaused, ({ one }) => ({
  protocol: one(protocol, {
    fields: [actionPaused.protocolId],
    references: [protocol.id],
  }),
  pToken: one(pToken, {
    fields: [actionPaused.pTokenId],
    references: [pToken.id],
  }),
  transaction: one(transaction, {
    fields: [actionPaused.transactionId],
    references: [transaction.id],
  }),
}));

export const pTokenRelations = relations(pToken, ({ one, many }) => ({
  creationTransaction: one(transaction, {
    fields: [pToken.creationTransactionId],
    references: [transaction.id],
  }),
  actionsPaused: many(actionPaused),
  underlyingToken: one(underlyingToken, {
    fields: [pToken.underlyingId],
    references: [underlyingToken.id],
  }),
  protocol: one(protocol, {
    fields: [pToken.protocolId],
    references: [protocol.id],
  }),
  marketsEntered: many(marketEntered),
  marketsExited: many(marketExited),
  deposits: many(deposit),
  withdraws: many(withdraw),
  repayBorrows: many(repayBorrow),
  borrows: many(borrow),
  transfers: many(transfer),
  borrowLiquidations: many(liquidateBorrow, {
    relationName: 'borrowPTokenId',
  }),
  collateralLiquidations: many(liquidateBorrow, {
    relationName: 'collateralPTokenId',
  }),
  userBalances: many(userBalance),
  eModes: many(pTokenEMode),
  priceSnapshots: many(priceSnapshot),
  aprSnapshots: many(priceSnapshot),
}));

export const marketEnteredRelations = relations(marketEntered, ({ one }) => ({
  transaction: one(transaction, {
    fields: [marketEntered.transactionId],
    references: [transaction.id],
  }),
  pToken: one(pToken, {
    fields: [marketEntered.pTokenId],
    references: [pToken.id],
  }),
  user: one(user, {
    fields: [marketEntered.userId],
    references: [user.id],
  }),
}));

export const marketExitedRelations = relations(marketExited, ({ one }) => ({
  transaction: one(transaction, {
    fields: [marketExited.transactionId],
    references: [transaction.id],
  }),
  pToken: one(pToken, {
    fields: [marketExited.pTokenId],
    references: [pToken.id],
  }),
  user: one(user, {
    fields: [marketExited.userId],
    references: [user.id],
  }),
}));

export const underlyingTokenRelations = relations(
  underlyingToken,
  ({ many }) => ({
    pTokens: many(pToken),
  })
);

export const userRelations = relations(user, ({ many }) => ({
  marketsEntered: many(marketEntered),
  marketsExited: many(marketExited),
  deposits: many(deposit),
  withdraws: many(withdraw),
  repayBorrows: many(repayBorrow),
  borrows: many(borrow),
  transfersSent: many(transfer, { relationName: 'fromId' }),
  transfersReceived: many(transfer, { relationName: 'toId' }),
  liquidationsExecuted: many(liquidateBorrow, { relationName: 'liquidatorId' }),
  liquidationsSuffered: many(liquidateBorrow, { relationName: 'borrowerId' }),
  balances: many(userBalance),
  delegates: many(userDelegation),
  delegateUpdated: many(delegateUpdated),
  eModes: many(userEMode),
}));

export const transactionRelations = relations(transaction, ({ many }) => ({
  marketsEntered: many(marketEntered),
  marketsExited: many(marketExited),
  actionsPaused: many(actionPaused),
  protocolsCreation: many(protocol),
  pTokensCreation: many(pToken),
  deposits: many(deposit),
  withdraws: many(withdraw),
  repayBorrows: many(repayBorrow),
  borrows: many(borrow),
  transfers: many(transfer),
  liquidations: many(liquidateBorrow),
  delegateUpdated: many(delegateUpdated),
}));

export const depositRelations = relations(deposit, ({ one }) => ({
  transaction: one(transaction, {
    fields: [deposit.transactionId],
    references: [transaction.id],
  }),
  pToken: one(pToken, {
    fields: [deposit.pTokenId],
    references: [pToken.id],
  }),
  user: one(user, {
    fields: [deposit.userId],
    references: [user.id],
  }),
}));

export const withdrawRelations = relations(withdraw, ({ one }) => ({
  transaction: one(transaction, {
    fields: [withdraw.transactionId],
    references: [transaction.id],
  }),
  pToken: one(pToken, {
    fields: [withdraw.pTokenId],
    references: [pToken.id],
  }),
  user: one(user, {
    fields: [withdraw.userId],
    references: [user.id],
  }),
}));

export const repayRelations = relations(repayBorrow, ({ one }) => ({
  transaction: one(transaction, {
    fields: [repayBorrow.transactionId],
    references: [transaction.id],
  }),
  pToken: one(pToken, {
    fields: [repayBorrow.pTokenId],
    references: [pToken.id],
  }),
  user: one(user, {
    fields: [repayBorrow.userId],
    references: [user.id],
  }),
}));

export const borrowRelations = relations(borrow, ({ one }) => ({
  transaction: one(transaction, {
    fields: [borrow.transactionId],
    references: [transaction.id],
  }),
  pToken: one(pToken, {
    fields: [borrow.pTokenId],
    references: [pToken.id],
  }),
  user: one(user, {
    fields: [borrow.userId],
    references: [user.id],
  }),
}));

export const transferRelations = relations(transfer, ({ one }) => ({
  transaction: one(transaction, {
    fields: [transfer.transactionId],
    references: [transaction.id],
  }),
  pToken: one(pToken, {
    fields: [transfer.pTokenId],
    references: [pToken.id],
  }),
  from: one(user, {
    fields: [transfer.fromId],
    references: [user.id],
  }),
  to: one(user, {
    fields: [transfer.toId],
    references: [user.id],
  }),
}));

export const liquidationRelations = relations(liquidateBorrow, ({ one }) => ({
  transaction: one(transaction, {
    fields: [liquidateBorrow.transactionId],
    references: [transaction.id],
  }),
  borrowPToken: one(pToken, {
    fields: [liquidateBorrow.borrowPTokenId],
    references: [pToken.id],
  }),
  collateralPToken: one(pToken, {
    fields: [liquidateBorrow.collateralPTokenId],
    references: [pToken.id],
  }),
  liquidator: one(user, {
    fields: [liquidateBorrow.liquidatorId],
    references: [user.id],
  }),
  borrower: one(user, {
    fields: [liquidateBorrow.borrowerId],
    references: [user.id],
  }),
}));

export const userBalanceRelations = relations(userBalance, ({ one }) => ({
  pToken: one(pToken, {
    fields: [userBalance.pTokenId],
    references: [pToken.id],
  }),
  user: one(user, {
    fields: [userBalance.userId],
    references: [user.id],
  }),
}));

export const userDelegationRelations = relations(userDelegation, ({ one }) => ({
  user: one(user, {
    fields: [userDelegation.userId],
    references: [user.id],
  }),
  protocol: one(protocol, {
    fields: [userDelegation.protocolId],
    references: [protocol.id],
  }),
}));

export const delegateUpdatedRelations = relations(
  delegateUpdated,
  ({ one }) => ({
    protocol: one(protocol, {
      fields: [delegateUpdated.protocolId],
      references: [protocol.id],
    }),
    transaction: one(transaction, {
      fields: [delegateUpdated.transactionId],
      references: [transaction.id],
    }),
    user: one(user, {
      fields: [delegateUpdated.userId],
      references: [user.id],
    }),
  })
);

export const eModeRelations = relations(eMode, ({ one, many }) => ({
  protocol: one(protocol, {
    fields: [eMode.protocolId],
    references: [protocol.id],
  }),
  pTokens: many(pTokenEMode),
  users: many(userEMode),
}));

export const pTokenEModeRelations = relations(pTokenEMode, ({ one }) => ({
  eMode: one(eMode, {
    fields: [pTokenEMode.eModeId],
    references: [eMode.id],
  }),
  pToken: one(pToken, {
    fields: [pTokenEMode.pTokenId],
    references: [pToken.id],
  }),
}));

export const userEModeRelations = relations(userEMode, ({ one }) => ({
  eMode: one(eMode, {
    fields: [userEMode.eModeId],
    references: [eMode.id],
  }),
  user: one(user, {
    fields: [userEMode.userId],
    references: [user.id],
  }),
}));

export const priceSnapshotRelations = relations(priceSnapshot, ({ one }) => ({
  pToken: one(pToken, {
    fields: [priceSnapshot.pTokenId],
    references: [pToken.id],
  }),
}));

export const aprSnapshotRelations = relations(priceSnapshot, ({ one }) => ({
  pToken: one(pToken, {
    fields: [priceSnapshot.pTokenId],
    references: [pToken.id],
  }),
}));
