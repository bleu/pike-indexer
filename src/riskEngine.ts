import { ponder } from 'ponder:registry';
import { getOrCreateTx } from './utils/transaction';
import { actionPaused, protocol, pToken } from 'ponder:schema';
import { getTxId, getUniqueContractId } from './utils/id';
import { getActionPausedProtocolData } from './utils/actionPaused';
import { readPTokenInfo } from './utils/multicalls';
import { getOrCreateUnderlying } from './utils/underlying';

ponder.on('RiskEngine:MarketListed', async ({ context, event }) => {
  // Creates a new pToken for the protocol related to the risk engine
  const id = getUniqueContractId(context.network.chainId, event.args.pToken);

  const protocolIdDb = getUniqueContractId(
    context.network.chainId,
    event.log.address
  );

  const pTokenInfo = await readPTokenInfo(
    context,
    event.args.pToken,
    event.log.address
  );

  const underlyingId = getUniqueContractId(
    context.network.chainId,
    pTokenInfo.asset
  );

  await Promise.all([
    context.db.insert(pToken).values({
      id,
      creationTransactionId: getTxId(event, context),
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
    }),
    getOrCreateUnderlying(pTokenInfo.asset, context),
    getOrCreateTx(event, context),
  ]);
});

ponder.on(
  'RiskEngine:ActionPaused(string action, bool pauseState)',
  async ({ context, event }) => {
    const id = `${event.log.address}-${context.network.chainId}-${event.args.action}`;
    const transactionId = getTxId(event, context);

    const protocolId = getUniqueContractId(
      context.network.chainId,
      event.log.address
    );

    await Promise.all([
      context.db.insert(actionPaused).values({
        id,
        transactionId,
        chainId: BigInt(context.network.chainId),
        action: event.args.action as 'Mint' | 'Borrow' | 'Transfer' | 'Seize',
        pauseState: event.args.pauseState,
        protocolId,
      }),
      getOrCreateTx(event, context),
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
    const id = `${event.args.pToken}-${context.network.chainId}-${event.args.action}`;
    const transactionId = getTxId(event, context);

    const pTokenId = getUniqueContractId(
      context.network.chainId,
      event.args.pToken
    );

    await Promise.all([
      context.db.insert(actionPaused).values({
        id,
        transactionId,
        chainId: BigInt(context.network.chainId),
        action: event.args.action as 'Mint' | 'Borrow' | 'Transfer' | 'Seize',
        pauseState: event.args.pauseState,
        pTokenId,
      }),
      getOrCreateTx(event, context),
      context.db
        .update(pToken, { id: pTokenId })
        .set(
          getActionPausedProtocolData(event.args.action, event.args.pauseState)
        ),
    ]);
  }
);

ponder.on('RiskEngine:NewMarketConfiguration', async ({ context, event }) => {
  const pTokenId = getUniqueContractId(
    context.network.chainId,
    event.args.pToken
  );

  await context.db.update(pToken, { id: pTokenId }).set({
    liquidationIncentive: event.args.newConfig.liquidationIncentiveMantissa,
    liquidationThreshold: event.args.newConfig.liquidationThresholdMantissa,
    collateralFactor: event.args.newConfig.collateralFactorMantissa,
  });
});

ponder.on('RiskEngine:NewCloseFactor', async ({ context, event }) => {
  // This event should emit the pToken address on the args.
  // when this event is fixed, uncomment the following code
  // const pTokenId = getUniqueContractId(
  //   context.network.chainId,
  //   event.args.pToken
  // );
  // await context.db.update(pToken, { id: pTokenId }).set({
  //   closeFactor: event.args.newCloseFactorMantissa,
  // });
});

ponder.on('RiskEngine:NewSupplyCap', async ({ context, event }) => {
  const pTokenId = getUniqueContractId(
    context.network.chainId,
    event.args.pToken
  );

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
  const pTokenId = getUniqueContractId(
    context.network.chainId,
    event.args.pToken
  );

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
  const protocolId = getUniqueContractId(
    context.network.chainId,
    event.log.address
  );

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
  const protocolId = getUniqueContractId(
    context.network.chainId,
    event.log.address
  );

  await context.db
    .update(protocol, { id: protocolId })
    .set({
      oracle: event.args.newOracleEngine,
    })
    .catch(error => {
      console.error(error.message);
    });
});
