import { onchainEnum, onchainTable, relations } from 'ponder';
import { zeroAddress } from 'viem';

export const action = onchainEnum('action', [
  'Mint',
  'Borrow',
  'Transfer',
  'Seize',
]);

export const transaction = onchainTable('Transaction', t => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  blockHash: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex(),
  gas: t.bigint(),
  gasPrice: t.bigint(),
}));

export const protocol = onchainTable('Protocol', t => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  protocolId: t.bigint().notNull().default(0n),
  riskEngine: t.hex().notNull(),
  timelock: t.hex().notNull(),
  creationTransactionId: t.text().notNull(),
  initialGovernor: t.hex().notNull(),
  configuratorShare: t.bigint().notNull(),
  ownerShare: t.bigint().notNull(),
  oracle: t.hex().notNull(),
  isBorrowPaused: t.boolean().notNull().default(false),
  isMintPaused: t.boolean().notNull().default(false),
  isTransferPaused: t.boolean().notNull().default(false),
  isSeizePaused: t.boolean().notNull().default(false),
}));

export const pToken = onchainTable('PToken', t => ({
  id: t.text().primaryKey(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
  protocolId: t.text().notNull(),
  index: t.bigint(),
  underlyingId: t.text().notNull(),
  symbol: t.text().notNull(),
  name: t.text().notNull(),
  decimals: t.numeric().notNull(),
  liquidationThreshold: t.bigint().notNull(),
  liquidationIncentive: t.bigint().notNull(),
  reserveFactor: t.bigint().notNull(),
  collateralFactor: t.bigint().notNull(),
  protocolSeizeShare: t.bigint().notNull(),
  closeFactor: t.bigint().notNull(),
  supplyCap: t.bigint().notNull(),
  borrowCap: t.bigint().notNull(),
  creationTransactionId: t.text().notNull(),
  exchangeRateCurrent: t.bigint().notNull(),
  borrowRatePerSecond: t.bigint().notNull(),
  supplyRatePerSecond: t.bigint().notNull(),
  borrowIndex: t.bigint().notNull().default(0n),
  cash: t.bigint().notNull().default(0n),
  totalSupply: t.bigint().notNull().default(0n),
  totalReserves: t.bigint().notNull().default(0n),
  totalBorrows: t.bigint().notNull().default(0n),
  isBorrowPaused: t.boolean().notNull().default(false),
  isMintPaused: t.boolean().notNull().default(false),
  isTransferPaused: t.boolean().notNull().default(false),
  isSeizePaused: t.boolean().notNull().default(false),
}));

export const user = onchainTable('User', t => ({
  id: t.text().primaryKey(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
}));

export const marketEntered = onchainTable('MarketEntered', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  userId: t.text().notNull(),
}));

export const marketExited = onchainTable('MarketExited', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  userId: t.text().notNull(),
}));

export const liquidateBorrow = onchainTable('LiquidateBorrow', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  liquidatorId: t.text().notNull(),
  borrowerId: t.text().notNull(),
  borrowPTokenId: t.text().notNull(),
  collateralPTokenId: t.text().notNull(),
  repayAssets: t.bigint().notNull(),
  seizeShares: t.bigint().notNull(),
}));

export const deposit = onchainTable('Deposit', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  minter: t.hex().notNull(),
  onBehalfOfId: t.text().notNull(),
  assets: t.bigint().notNull(),
  shares: t.bigint().notNull(),
}));

export const withdraw = onchainTable('Withdraw', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  sender: t.hex().notNull(),
  receiver: t.hex().notNull(),
  onBehalfOfId: t.text().notNull(),
  assets: t.bigint().notNull(),
  shares: t.bigint().notNull(),
}));

export const repayBorrow = onchainTable('Repay', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  payer: t.hex().notNull(),
  onBehalfOfId: t.text().notNull(),
  repayAssets: t.bigint().notNull(),
  accountBorrows: t.bigint().notNull(),
  totalBorrows: t.bigint().notNull(),
}));

export const borrow = onchainTable('Borrow', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  borrower: t.hex().notNull(),
  onBehalfOfId: t.text().notNull(),
  borrowAssets: t.bigint().notNull(),
  accountBorrows: t.bigint().notNull(),
  totalBorrows: t.bigint().notNull(),
}));

export const transfer = onchainTable('Transfers', t => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  fromId: t.text().notNull(),
  toId: t.text().notNull(),
  shares: t.bigint().notNull(),
}));

export const underlyingToken = onchainTable('UnderlyingToken', t => ({
  id: t.text().primaryKey(),
  symbol: t.text().notNull(),
  name: t.text().notNull(),
  decimals: t.numeric().notNull(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
}));

export const actionPaused = onchainTable('actionPaused', t => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  protocolId: t.text(),
  pTokenId: t.text(),
  action: action('action').notNull(),
  pauseState: t.boolean().notNull(),
  transactionId: t.text().notNull(),
}));

export const protocolRelations = relations(protocol, ({ one, many }) => ({
  creationTransaction: one(transaction, {
    fields: [protocol.creationTransactionId],
    references: [transaction.id],
  }),
  actionsPaused: many(actionPaused),
  pTokens: many(pToken),
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
  onBehalfOf: one(user, {
    fields: [deposit.onBehalfOfId],
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
  onBehalfOf: one(user, {
    fields: [withdraw.onBehalfOfId],
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
  onBehalfOf: one(user, {
    fields: [repayBorrow.onBehalfOfId],
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
  onBehalfOf: one(user, {
    fields: [borrow.onBehalfOfId],
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
