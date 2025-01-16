import { ponder } from 'ponder:registry';
import {
  actionPaused,
  delegateUpdated,
  eMode,
  marketEntered,
  marketExited,
  protocol,
  pToken,
  userEMode,
} from 'ponder:schema';
import {
  getTransactionId,
  getAddressId,
  getEventId,
  getUserDelegationId,
  getEModeId,
  getPTokenEModeId,
  getUserEModeId,
} from './utils/id';
import { readPTokenInfo } from './utils/multicalls';
import { currentRatePerSecondToAPY } from './utils/calculations';
import {
  createIfNotExistsTransaction,
  createIfNotExistsUnderlying,
  createIfNotExistsUser,
  createOrDeleteDelegation,
  insertOrUpdateUserBalance,
  upsertOrDeletePTokenEMode,
} from './utils/databaseWriteUtils';
import { getActionPausedProtocolData } from './utils/actionPaused';

ponder.on('RiskEngine:MarketListed', async ({ context, event }) => {
  // Creates a new pToken for the protocol related to the risk engine
  const id = getAddressId(context.network.chainId, event.args.pToken);

  const protocolIdDb = getAddressId(context.network.chainId, event.log.address);

  const pTokenInfo = await readPTokenInfo(
    context,
    event.args.pToken,
    event.log.address
  );

  const underlyingId = getAddressId(context.network.chainId, pTokenInfo.asset);

  await Promise.all([
    context.db.insert(pToken).values({
      id,
      creationTransactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      address: event.args.pToken,
      protocolId: protocolIdDb,
      underlyingId: underlyingId,
      symbol: pTokenInfo.symbol,
      name: pTokenInfo.name,
      decimals: `${pTokenInfo.decimals}`,
      borrowCap: pTokenInfo.borrowCap,
      supplyCap: pTokenInfo.supplyCap,
      collateralFactor: pTokenInfo.collateralFactor,
      closeFactor: pTokenInfo.closeFactor,
      exchangeRateCurrent: pTokenInfo.exchangeRateCurrent,
      liquidationIncentive: pTokenInfo.liquidationIncentive,
      liquidationThreshold: pTokenInfo.liquidationThreshold,
      protocolSeizeShare: pTokenInfo.protocolSeizeShare,
      borrowRatePerSecond: pTokenInfo.borrowRatePerSecond,
      supplyRatePerSecond: pTokenInfo.supplyRatePerSecond,
      reserveFactor: pTokenInfo.reserveFactor,
      borrowIndex: pTokenInfo.borrowIndex,
      borrowRateAPY: currentRatePerSecondToAPY(pTokenInfo.borrowRatePerSecond),
      supplyRateAPY: currentRatePerSecondToAPY(pTokenInfo.supplyRatePerSecond),
    }),
    createIfNotExistsUnderlying(pTokenInfo.asset, context),
    createIfNotExistsTransaction(event, context),
  ]);
});

ponder.on(
  'RiskEngine:ActionPaused(string action, bool pauseState)',
  async ({ context, event }) => {
    const id = getEventId(event);
    const transactionId = getTransactionId(event, context);

    const protocolId = getAddressId(context.network.chainId, event.log.address);

    await Promise.all([
      context.db.insert(actionPaused).values({
        id,
        transactionId,
        chainId: BigInt(context.network.chainId),
        action: event.args.action as 'Mint' | 'Borrow' | 'Transfer' | 'Seize',
        pauseState: event.args.pauseState,
        protocolId,
      }),
      createIfNotExistsTransaction(event, context),
      context.db
        .update(protocol, { id: protocolId })
        .set(
          getActionPausedProtocolData(event.args.action, event.args.pauseState)
        ),
    ]);
  }
);

ponder.on(
  'RiskEngine:ActionPaused(address pToken, string action, bool pauseState)',
  async ({ context, event }) => {
    const id = getEventId(event);
    const transactionId = getTransactionId(event, context);

    const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

    await Promise.all([
      context.db.insert(actionPaused).values({
        id,
        transactionId,
        chainId: BigInt(context.network.chainId),
        action: event.args.action as 'Mint' | 'Borrow' | 'Transfer' | 'Seize',
        pauseState: event.args.pauseState,
        pTokenId,
      }),
      createIfNotExistsTransaction(event, context),
      context.db
        .update(pToken, { id: pTokenId })
        .set(
          getActionPausedProtocolData(event.args.action, event.args.pauseState)
        ),
    ]);
  }
);

ponder.on('RiskEngine:NewMarketConfiguration', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  await context.db.update(pToken, { id: pTokenId }).set({
    liquidationIncentive: event.args.newConfig.liquidationIncentiveMantissa,
    liquidationThreshold: event.args.newConfig.liquidationThresholdMantissa,
    collateralFactor: event.args.newConfig.collateralFactorMantissa,
  });
});

ponder.on('RiskEngine:NewCloseFactor', async ({ context, event }) => {
  // This event should emit the pToken address on the args.
  // when this event is fixed, uncomment the following code
  // const pTokenId = getAddressId(
  //   context.network.chainId,
  //   event.args.pToken
  // );
  // await context.db.update(pToken, { id: pTokenId }).set({
  //   closeFactor: event.args.newCloseFactorMantissa,
  // });
});

ponder.on('RiskEngine:NewSupplyCap', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  await context.db
    .update(pToken, { id: pTokenId })
    .set({
      supplyCap: event.args.newSupplyCap,
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('RiskEngine:NewBorrowCap', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  await context.db
    .update(pToken, { id: pTokenId })
    .set({
      borrowCap: event.args.newBorrowCap,
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('RiskEngine:NewReserveShares', async ({ context, event }) => {
  const protocolId = getAddressId(context.network.chainId, event.log.address);

  await context.db
    .update(protocol, { id: protocolId })
    .set({
      ownerShare: event.args.newOwnerShareMantissa,
      configuratorShare: event.args.newConfiguratorShareMantissa,
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('RiskEngine:NewOracleEngine', async ({ context, event }) => {
  const protocolId = getAddressId(context.network.chainId, event.log.address);

  await context.db
    .update(protocol, { id: protocolId })
    .set({
      oracle: event.args.newOracleEngine,
    })
    .catch(error => {
      console.error(error.message);
    });
});

ponder.on('RiskEngine:MarketEntered', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  const marketEnteredId = getEventId(event);

  const userId = getAddressId(context.network.chainId, event.args.account);

  const chainId = BigInt(context.network.chainId);

  await Promise.all([
    createIfNotExistsTransaction(event, context),
    createIfNotExistsUser(context, event.args.account),
    context.db.insert(marketEntered).values({
      id: marketEnteredId,
      transactionId: getTransactionId(event, context),
      chainId,
      pTokenId,
      userId,
    }),
    insertOrUpdateUserBalance(context, {
      userId,
      pTokenId,
      isCollateral: true,
      chainId,
    }),
  ]);
});

ponder.on('RiskEngine:MarketExited', async ({ context, event }) => {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  const marketExitedId = getEventId(event);

  const userId = getAddressId(context.network.chainId, event.args.account);

  const chainId = BigInt(context.network.chainId);

  await Promise.all([
    createIfNotExistsTransaction(event, context),
    createIfNotExistsUser(context, event.args.account),
    context.db.insert(marketExited).values({
      id: marketExitedId,
      transactionId: getTransactionId(event, context),
      chainId,
      pTokenId,
      userId,
    }),
    insertOrUpdateUserBalance(context, {
      userId,
      pTokenId,
      isCollateral: false,
      chainId,
    }),
  ]);
});

ponder.on('RiskEngine:DelegateUpdated', async ({ context, event }) => {
  const userId = getAddressId(context.network.chainId, event.args.approver);
  const protocolId = getAddressId(context.network.chainId, event.log.address);
  const chainId = BigInt(context.network.chainId);

  await Promise.all([
    createIfNotExistsUser(context, event.args.approver),
    createIfNotExistsTransaction(event, context),
    context.db.insert(delegateUpdated).values({
      id: getEventId(event),
      transactionId: getTransactionId(event, context),
      chainId,
      userId,
      protocolId,
      delegateAddress: event.args.delegate,
      approved: event.args.approved,
    }),
    createOrDeleteDelegation(
      context,
      {
        id: getUserDelegationId(userId, event.args.delegate),
        userId,
        protocolId,
        chainId,
        delegateAddress: event.args.delegate,
      },
      event.args.approved
    ),
  ]);
});

ponder.on('RiskEngine:NewEModeConfiguration', async ({ context, event }) => {
  const protocolId = getAddressId(context.network.chainId, event.log.address);

  const eModeId = getEModeId(protocolId, event.args.categoryId);

  await context.db.update(eMode, { id: eModeId }).set({
    chainId: BigInt(context.network.chainId),
    categoryId: `${event.args.categoryId}`,
    protocolId,
    liquidationIncentive: event.args.newConfig.liquidationIncentiveMantissa,
    liquidationThreshold: event.args.newConfig.liquidationThresholdMantissa,
    collateralFactor: event.args.newConfig.collateralFactorMantissa,
  });
});

ponder.on('RiskEngine:EModeUpdated', async ({ context, event }) => {
  const protocolId = getAddressId(context.network.chainId, event.log.address);
  const eModeId = getEModeId(protocolId, event.args.categoryId);
  const pTokenEModeId = getPTokenEModeId(event.args.pToken, eModeId);
  const chainId = BigInt(context.network.chainId);
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  await Promise.all([
    upsertOrDeletePTokenEMode(context, {
      id: pTokenEModeId,
      chainId,
      pTokenId,
      eModeId,
      borrowEnabled: event.args.borrowStatus,
      collateralEnabled: event.args.collateralStatus,
    }),
    context.db
      .insert(eMode)
      .values({
        id: eModeId,
        chainId,
        protocolId,
        categoryId: `${event.args.categoryId}`,
      })
      .onConflictDoNothing(),
  ]);
});

ponder.on('RiskEngine:EModeSwitched', async ({ context, event }) => {
  const protocolId = getAddressId(context.network.chainId, event.log.address);
  const eModeId = getEModeId(protocolId, event.args.newCategory);
  const chainId = BigInt(context.network.chainId);
  const userId = getAddressId(context.network.chainId, event.args.account);
  const userEModeId = getUserEModeId(userId, eModeId);

  const params = {
    chainId,
    eModeId,
    userId,
  };

  await context.db
    .insert(userEMode)
    .values({
      id: userEModeId,
      ...params,
    })
    .onConflictDoUpdate(params);
});
