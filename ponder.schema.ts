import { onchainEnum, onchainTable, relations } from "ponder";

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
  protocolId: t.bigint().notNull(),
  riskEngine: t.hex().notNull(),
  timelock: t.hex().notNull(),
  creationTransactionId: t.text().notNull(),
  initialGovernor: t.hex().notNull(),
  isBorrowPaused: t.boolean().notNull().default(false),
  isMintPaused: t.boolean().notNull().default(false),
  isTransferPaused: t.boolean().notNull().default(false),
  isSeizePaused: t.boolean().notNull().default(false),
}));

export const actionPaused = onchainTable("actionPaused", (t) => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  protocolId: t.text().notNull(),
  pTokenId: t.bigint(),
  action: action("action").notNull(),
  pauseState: t.boolean().notNull(),
  transactionId: t.text().notNull(),
}));

export const protocolRelations = relations(protocol, ({ one, many }) => ({
  transaction: one(transaction, {
    fields: [protocol.creationTransactionId],
    references: [transaction.id],
  }),
  actionPauseds: many(actionPaused),
}));

export const actionPausedRelations = relations(actionPaused, ({ one }) => ({
  protocol: one(protocol, {
    fields: [actionPaused.protocolId],
    references: [protocol.id],
  }),
  transaction: one(transaction, {
    fields: [actionPaused.transactionId],
    references: [transaction.id],
  }),
}));
