import { Context, Event, ponder } from 'ponder:registry';
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
import { eq } from 'ponder';
import { PTokenAbi } from '../abis/PTokenAbi';
import { RiskEngineAbiV0 } from '../abis/RiskEngineAbi/v0';

// RiskEngine Handlers
async function handleMarketListed({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:MarketListed'
    | 'RiskEngineFromFactoryV1:MarketListed'
  >;
}) {
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
      ...pTokenInfo,
      id,
      creationTransactionId: getTransactionId(event, context),
      chainId: BigInt(context.network.chainId),
      address: event.args.pToken,
      protocolId: protocolIdDb,
      underlyingId: underlyingId,
      borrowRateAPY: currentRatePerSecondToAPY(pTokenInfo.borrowRatePerSecond),
      supplyRateAPY: currentRatePerSecondToAPY(pTokenInfo.supplyRatePerSecond),
      updatedAt: event.block.timestamp,
    }),
    createIfNotExistsUnderlying(pTokenInfo.asset, context),
    createIfNotExistsTransaction(event, context),
  ]);
}

async function handleActionPausedGlobal({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:ActionPaused(string action, bool pauseState)'
    | 'RiskEngineFromFactoryV1:ActionPaused(string action, bool pauseState)'
  >;
}) {
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

async function handleActionPausedMarket({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:ActionPaused(address pToken, string action, bool pauseState)'
    | 'RiskEngineFromFactoryV1:ActionPaused(address pToken, string action, bool pauseState)'
  >;
}) {
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
    context.db.update(pToken, { id: pTokenId }).set({
      ...getActionPausedProtocolData(event.args.action, event.args.pauseState),
      updatedAt: event.block.timestamp,
    }),
  ]);
}

async function handleNewMarketConfiguration({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:NewMarketConfiguration'
    | 'RiskEngineFromFactoryV1:NewMarketConfiguration'
  >;
}) {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  await context.db.update(pToken, { id: pTokenId }).set({
    liquidationIncentive: event.args.newConfig.liquidationIncentiveMantissa,
    liquidationThreshold: event.args.newConfig.liquidationThresholdMantissa,
    collateralFactor: event.args.newConfig.collateralFactorMantissa,
    updatedAt: event.block.timestamp,
  });
}

async function handleNewSupplyCap({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:NewSupplyCap'
    | 'RiskEngineFromFactoryV1:NewSupplyCap'
  >;
}) {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  await context.db
    .update(pToken, { id: pTokenId })
    .set({
      supplyCap: event.args.newSupplyCap,
      updatedAt: event.block.timestamp,
    })
    .catch(error => {
      console.error(error.message);
    });
}

async function handleNewBorrowCap({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:NewBorrowCap'
    | 'RiskEngineFromFactoryV1:NewBorrowCap'
  >;
}) {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  await context.db
    .update(pToken, { id: pTokenId })
    .set({
      borrowCap: event.args.newBorrowCap,
      updatedAt: event.block.timestamp,
    })
    .catch(error => {
      console.error(error.message);
    });
}

async function handleNewReserveShares({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:NewReserveShares'
    | 'RiskEngineFromFactoryV1:NewReserveShares'
  >;
}) {
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
}

async function handleNewOracleEngine({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:NewOracleEngine'
    | 'RiskEngineFromFactoryV1:NewOracleEngine'
  >;
}) {
  const protocolId = getAddressId(context.network.chainId, event.log.address);

  await context.db
    .update(protocol, { id: protocolId })
    .set({
      oracle: event.args.newOracleEngine,
    })
    .catch(error => {
      console.error(error.message);
    });
}

async function handleMarketEntered({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:MarketEntered'
    | 'RiskEngineFromFactoryV1:MarketEntered'
  >;
}) {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  const marketEnteredId = getEventId(event);

  const userId = event.args.account;

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
    insertOrUpdateUserBalance(context, event, {
      userId,
      pTokenId,
      isCollateral: true,
      chainId,
    }),
  ]);
}

async function handleMarketExited({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:MarketExited'
    | 'RiskEngineFromFactoryV1:MarketExited'
  >;
}) {
  const pTokenId = getAddressId(context.network.chainId, event.args.pToken);

  const marketExitedId = getEventId(event);

  const userId = event.args.account;

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
    insertOrUpdateUserBalance(context, event, {
      userId,
      pTokenId,
      isCollateral: false,
      chainId,
    }),
  ]);
}

async function handleDelegateUpdated({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:DelegateUpdated'
    | 'RiskEngineFromFactoryV1:DelegateUpdated'
  >;
}) {
  const userId = event.args.approver;
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
        id: getUserDelegationId(
          userId,
          event.args.delegate,
          context.network.chainId
        ),
        userId,
        protocolId,
        chainId,
        delegateAddress: event.args.delegate,
      },
      event.args.approved
    ),
  ]);
}

async function handleNewEModeConfiguration({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:NewEModeConfiguration'
    | 'RiskEngineFromFactoryV1:NewEModeConfiguration'
  >;
}) {
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
}

async function handleEModeUpdated({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:EModeUpdated'
    | 'RiskEngineFromFactoryV1:EModeUpdated'
  >;
}) {
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
}

async function handleEModeSwitched({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:EModeSwitched'
    | 'RiskEngineFromFactoryV1:EModeSwitched'
  >;
}) {
  const protocolId = getAddressId(context.network.chainId, event.log.address);
  const eModeId = getEModeId(protocolId, event.args.newCategory);
  const chainId = BigInt(context.network.chainId);
  const userEModeId = getUserEModeId(event.args.account, eModeId);

  const params = {
    chainId,
    eModeId,
    userId: event.args.account,
  };

  await context.db
    .insert(userEMode)
    .values({
      id: userEModeId,
      ...params,
    })
    .onConflictDoUpdate(params);
}

async function handleNewCloseFactor({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'RiskEngineFromFactoryV0:NewCloseFactor'
    | 'RiskEngineFromFactoryV1:NewCloseFactor'
  >;
}) {
  const protocolId = getAddressId(context.network.chainId, event.log.address);
  const pTokensData = await context.db.sql
    .select()
    .from(pToken)
    .where(eq(pToken.protocolId, protocolId));

  await Promise.all(
    pTokensData.map(async pTokenData => {
      const closeFactor = await context.client.readContract({
        abi: RiskEngineAbiV0,
        address: event.log.address,
        functionName: 'closeFactor',
        args: [pTokenData.address],
      });
      await context.db
        .update(pToken, { id: pTokenData.id })
        .set({
          closeFactor,
        })
        .catch(error => {
          console.error(error.message);
        });
    })
  );
}

// Event registrations
ponder.on('RiskEngineFromFactoryV0:MarketListed', handleMarketListed);
ponder.on('RiskEngineFromFactoryV1:MarketListed', handleMarketListed);

ponder.on(
  'RiskEngineFromFactoryV0:ActionPaused(string action, bool pauseState)',
  handleActionPausedGlobal
);
ponder.on(
  'RiskEngineFromFactoryV1:ActionPaused(string action, bool pauseState)',
  handleActionPausedGlobal
);

ponder.on(
  'RiskEngineFromFactoryV0:ActionPaused(address pToken, string action, bool pauseState)',
  handleActionPausedMarket
);
ponder.on(
  'RiskEngineFromFactoryV1:ActionPaused(address pToken, string action, bool pauseState)',
  handleActionPausedMarket
);

ponder.on(
  'RiskEngineFromFactoryV0:NewMarketConfiguration',
  handleNewMarketConfiguration
);
ponder.on(
  'RiskEngineFromFactoryV1:NewMarketConfiguration',
  handleNewMarketConfiguration
);

ponder.on('RiskEngineFromFactoryV0:NewSupplyCap', handleNewSupplyCap);
ponder.on('RiskEngineFromFactoryV1:NewSupplyCap', handleNewSupplyCap);

ponder.on('RiskEngineFromFactoryV0:NewBorrowCap', handleNewBorrowCap);
ponder.on('RiskEngineFromFactoryV1:NewBorrowCap', handleNewBorrowCap);

ponder.on('RiskEngineFromFactoryV0:NewReserveShares', handleNewReserveShares);
ponder.on('RiskEngineFromFactoryV1:NewReserveShares', handleNewReserveShares);

ponder.on('RiskEngineFromFactoryV0:NewOracleEngine', handleNewOracleEngine);
ponder.on('RiskEngineFromFactoryV1:NewOracleEngine', handleNewOracleEngine);

ponder.on('RiskEngineFromFactoryV0:MarketEntered', handleMarketEntered);
ponder.on('RiskEngineFromFactoryV1:MarketEntered', handleMarketEntered);

ponder.on('RiskEngineFromFactoryV0:MarketExited', handleMarketExited);
ponder.on('RiskEngineFromFactoryV1:MarketExited', handleMarketExited);

ponder.on('RiskEngineFromFactoryV0:DelegateUpdated', handleDelegateUpdated);
ponder.on('RiskEngineFromFactoryV1:DelegateUpdated', handleDelegateUpdated);

ponder.on(
  'RiskEngineFromFactoryV0:NewEModeConfiguration',
  handleNewEModeConfiguration
);
ponder.on(
  'RiskEngineFromFactoryV1:NewEModeConfiguration',
  handleNewEModeConfiguration
);

ponder.on('RiskEngineFromFactoryV0:EModeUpdated', handleEModeUpdated);
ponder.on('RiskEngineFromFactoryV1:EModeUpdated', handleEModeUpdated);

ponder.on('RiskEngineFromFactoryV0:EModeSwitched', handleEModeSwitched);
ponder.on('RiskEngineFromFactoryV1:EModeSwitched', handleEModeSwitched);

ponder.on('RiskEngineFromFactoryV0:NewCloseFactor', handleNewCloseFactor);
ponder.on('RiskEngineFromFactoryV1:NewCloseFactor', handleNewCloseFactor);
