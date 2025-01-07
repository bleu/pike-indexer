import { onchainEnum, onchainTable, relations } from "ponder";
import { zeroAddress } from "viem";

export const action = onchainEnum("action", [
  "Mint",
  "Borrow",
  "Transfer",
  "Seize",
]);

export const transaction = onchainTable("Transaction", (t) => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  transactionHash: t.hex().notNull(),
  timestamp: t.bigint().notNull(),
  blockNumber: t.bigint().notNull(),
  blockHash: t.hex().notNull(),
  from: t.hex().notNull(),
  to: t.hex(),
  gas: t.bigint(),
}));

export const protocol = onchainTable("Protocol", (t) => ({
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

export const pToken = onchainTable("PToken", (t) => ({
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
  cash: t.bigint().notNull().default(0n),
  totalSupply: t.bigint().notNull().default(0n),
  totalReserves: t.bigint().notNull().default(0n),
  totalBorrows: t.bigint().notNull().default(0n),
  isBorrowPaused: t.boolean().notNull().default(false),
  isMintPaused: t.boolean().notNull().default(false),
  isTransferPaused: t.boolean().notNull().default(false),
  isSeizePaused: t.boolean().notNull().default(false),
}));

export const user = onchainTable("User", (t) => ({
  id: t.text().primaryKey(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
}));

export const marketEntered = onchainTable("MarketEntered", (t) => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  userId: t.text().notNull(),
}));

export const marketExited = onchainTable("MarketExited", (t) => ({
  id: t.text().primaryKey(),
  transactionId: t.text().notNull(),
  chainId: t.bigint().notNull(),
  pTokenId: t.text().notNull(),
  userId: t.text().notNull(),
}));

export const underlyingToken = onchainTable("UnderlyingToken", (t) => ({
  id: t.text().primaryKey(),
  symbol: t.text().notNull(),
  name: t.text().notNull(),
  decimals: t.numeric().notNull(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
}));

export const actionPaused = onchainTable("actionPaused", (t) => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  protocolId: t.text(),
  pTokenId: t.text(),
  action: action("action").notNull(),
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
  marketEntered: many(marketEntered),
  marketExited: many(marketExited),
}));
