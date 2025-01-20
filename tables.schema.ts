import { onchainEnum, onchainTable, index } from 'ponder';
import { parseEther } from 'viem';

export const action = onchainEnum('action', [
  'Mint',
  'Borrow',
  'Transfer',
  'Seize',
]);

export const transaction = onchainTable('transaction', t => ({
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

export const protocol = onchainTable('protocol', t => ({
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
  // The oracle engine can change later to another address
  // that might not even be a beacon proxy
  // this is why we store it as init
  initOracleEngineBeaconProxyId: t.text().notNull(),
  timelockBeaconProxyId: t.text().notNull(),
  pTokenBeaconProxyId: t.text().notNull(),
  riskEngineBeaconProxyId: t.text().notNull(),
}));

export const beaconProxy = onchainTable('beaconProxy', t => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  beaconAddress: t.hex().notNull(),
  implementationAddress: t.hex().notNull(),
}));

export const pToken = onchainTable(
  'p_token',
  t => ({
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
    utilization: t.bigint().notNull().default(0n),
    borrowRatePerSecond: t.bigint().notNull(),
    supplyRatePerSecond: t.bigint().notNull(),
    borrowRateAPY: t.numeric().notNull(),
    supplyRateAPY: t.numeric().notNull(),
    borrowIndex: t.bigint().notNull().default(parseEther('1')),
    cash: t.bigint().notNull().default(0n),
    totalSupply: t.bigint().notNull().default(0n),
    totalReserves: t.bigint().notNull().default(0n),
    totalBorrows: t.bigint().notNull().default(0n),
    isBorrowPaused: t.boolean().notNull().default(false),
    isMintPaused: t.boolean().notNull().default(false),
    isTransferPaused: t.boolean().notNull().default(false),
    isSeizePaused: t.boolean().notNull().default(false),
    underlyingPriceCurrent: t.bigint().notNull().default(0n),
    totalBorrowUsdValue: t.numeric().notNull().default('0'),
    totalSupplyUsdValue: t.numeric().notNull().default('0'),
    updatedAt: t.bigint().notNull(),
    // These parameters are related to the Double Jump Rate Model
    // This was included on the pToken table because it is the only rate model for now
    // and the relation is 1:1 to the pToken.
    // If a new rate model is added, this can be refactored to a new table.
    baseRatePerSecond: t.bigint().notNull(),
    multiplierPerSecond: t.bigint().notNull(),
    firstJumpMultiplierPerSecond: t.bigint().notNull(),
    secondJumpMultiplierPerSecond: t.bigint().notNull(),
    firstKink: t.bigint().notNull(),
    secondKink: t.bigint().notNull(),
  }),
  table => ({
    protocolIdx: index().on(table.protocolId),
    underlyingIdx: index().on(table.underlyingId),
  })
);

export const eMode = onchainTable(
  'e_mode',
  t => ({
    id: t.text().primaryKey(),
    chainId: t.bigint().notNull(),
    protocolId: t.text().notNull(),
    categoryId: t.numeric().notNull(),
    collateralFactor: t.bigint().notNull().default(0n),
    liquidationThreshold: t.bigint().notNull().default(0n),
    liquidationIncentive: t.bigint().notNull().default(0n),
  }),
  table => ({
    protocolIdx: index().on(table.protocolId),
  })
);

export const pTokenEMode = onchainTable(
  'p_token_e_mode',
  t => ({
    id: t.text().primaryKey(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    eModeId: t.text().notNull(),
    borrowEnabled: t.boolean().notNull(),
    collateralEnabled: t.boolean().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    eModeIdx: index().on(table.eModeId),
  })
);

export const user = onchainTable('User', t => ({
  id: t.text().primaryKey(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
}));

export const userDelegation = onchainTable('user_delegation', t => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  userId: t.text().notNull(),
  protocolId: t.text().notNull(),
  delegateAddress: t.hex().notNull(),
}));

export const userEMode = onchainTable(
  'user_e_mode',
  t => ({
    id: t.text().primaryKey(),
    chainId: t.bigint().notNull(),
    userId: t.text().notNull(),
    eModeId: t.text().notNull(),
  }),
  table => ({
    userIdx: index().on(table.userId),
    eModeIdx: index().on(table.eModeId),
  })
);

export const delegateUpdated = onchainTable('delegated_updated', t => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  userId: t.text().notNull(),
  delegateAddress: t.hex().notNull(),
  protocolId: t.text().notNull(),
  transactionId: t.text().notNull(),
  approved: t.boolean().notNull(),
}));

export const marketEntered = onchainTable(
  'market_entered',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    userId: t.text().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    userIdx: index().on(table.userId),
    transactionIdx: index().on(table.transactionId),
  })
);

export const marketExited = onchainTable(
  'market_exited',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    userId: t.text().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    userIdx: index().on(table.userId),
    transactionIdx: index().on(table.transactionId),
  })
);

export const liquidateBorrow = onchainTable(
  'liquidate_borrow',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    liquidatorId: t.text().notNull(),
    borrowerId: t.text().notNull(),
    borrowPTokenId: t.text().notNull(),
    collateralPTokenId: t.text().notNull(),
    repayAssets: t.bigint().notNull(),
    seizeShares: t.bigint().notNull(),
    repayUsdValue: t.numeric().notNull(),
    seizeUsdValue: t.numeric().notNull(),
  }),
  table => ({
    liquidatorIdx: index().on(table.liquidatorId),
    borrowerIdx: index().on(table.borrowerId),
    borrowPTokenIdx: index().on(table.borrowPTokenId),
    collateralPTokenIdx: index().on(table.collateralPTokenId),
    transactionIdx: index().on(table.transactionId),
  })
);

export const deposit = onchainTable(
  'deposit',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    minter: t.hex().notNull(),
    userId: t.text().notNull(),
    assets: t.bigint().notNull(),
    shares: t.bigint().notNull(),
    usdValue: t.numeric().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    userIdx: index().on(table.userId),
    transactionIdx: index().on(table.transactionId),
  })
);

export const withdraw = onchainTable(
  'withdraw',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    sender: t.hex().notNull(),
    receiver: t.hex().notNull(),
    userId: t.text().notNull(),
    assets: t.bigint().notNull(),
    shares: t.bigint().notNull(),
    usdValue: t.numeric().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    userIdx: index().on(table.userId),
    transactionIdx: index().on(table.transactionId),
    receiverIdx: index().on(table.receiver),
  })
);

export const repayBorrow = onchainTable(
  'repay',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    payer: t.hex().notNull(),
    userId: t.text().notNull(),
    repayAssets: t.bigint().notNull(),
    accountBorrows: t.bigint().notNull(),
    totalBorrows: t.bigint().notNull(),
    usdValue: t.numeric().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    userIdx: index().on(table.userId),
    transactionIdx: index().on(table.transactionId),
  })
);

export const borrow = onchainTable(
  'borrow',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    borrower: t.hex().notNull(),
    userId: t.text().notNull(),
    borrowAssets: t.bigint().notNull(),
    accountBorrows: t.bigint().notNull(),
    totalBorrows: t.bigint().notNull(),
    usdValue: t.numeric().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    userIdx: index().on(table.userId),
    transactionIdx: index().on(table.transactionId),
  })
);

export const transfer = onchainTable(
  'transfers',
  t => ({
    id: t.text().primaryKey(),
    transactionId: t.text().notNull(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    fromId: t.text().notNull(),
    toId: t.text().notNull(),
    shares: t.bigint().notNull(),
    usdValue: t.numeric().notNull(),
  }),
  table => ({
    fromIdx: index().on(table.fromId),
    toIdx: index().on(table.toId),
    pTokenIdx: index().on(table.pTokenId),
    transactionIdx: index().on(table.transactionId),
  })
);

export const underlyingToken = onchainTable('underlying_token', t => ({
  id: t.text().primaryKey(),
  symbol: t.text().notNull(),
  name: t.text().notNull(),
  decimals: t.numeric().notNull(),
  address: t.hex().notNull(),
  chainId: t.bigint().notNull(),
}));

export const actionPaused = onchainTable('action_paused', t => ({
  id: t.text().primaryKey(),
  chainId: t.bigint().notNull(),
  protocolId: t.text(),
  pTokenId: t.text(),
  action: action('action').notNull(),
  pauseState: t.boolean().notNull(),
  transactionId: t.text().notNull(),
}));

export const userBalance = onchainTable(
  'user_balance',
  t => ({
    id: t.text().primaryKey(),
    chainId: t.bigint().notNull(),
    userId: t.text().notNull(),
    pTokenId: t.text().notNull(),
    supplyShares: t.bigint().notNull().default(0n),
    borrowAssets: t.bigint().notNull().default(0n),
    isCollateral: t.boolean().notNull().default(false),
    interestIndex: t.bigint().notNull().default(0n),
    updatedAt: t.bigint().notNull(),
  }),
  table => ({
    userIdx: index().on(table.userId),
    pTokenIdx: index().on(table.pTokenId),
  })
);

export const priceSnapshot = onchainTable(
  'price_snapshot',
  t => ({
    id: t.text().primaryKey(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    timestamp: t.bigint().notNull(),
    price: t.bigint().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    timestampIdx: index().on(table.timestamp),
  })
);

export const aprSnapshot = onchainTable(
  'apr_snapshot',
  t => ({
    id: t.text().primaryKey(),
    chainId: t.bigint().notNull(),
    pTokenId: t.text().notNull(),
    timestamp: t.bigint().notNull(),
    borrowRatePerSecond: t.bigint().notNull(),
    supplyRatePerSecond: t.bigint().notNull(),
  }),
  table => ({
    pTokenIdx: index().on(table.pTokenId),
    timestampIdx: index().on(table.timestamp),
  })
);
