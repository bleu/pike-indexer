import { ponder } from "ponder:registry";
import { protocol, pToken } from "ponder:schema";
import { getOrCreateTx } from "./utils/transaction";
import { getProtocolId, getTxId, getUniqueContractId } from "./utils/id";
import { readPTokenInfo } from "./utils/multicalls";
import { getOrCreateUnderlying } from "./utils/underlying";

ponder.on("Factory:ProtocolDeployed", async ({ context, event }) => {
  const id = getProtocolId(
    event.log.address,
    context.network.chainId,
    event.args.protocolId
  );
  const creationTransactionId = getTxId(event, context);

  await Promise.all([
    context.db.insert(protocol).values({
      id,
      creationTransactionId,
      chainId: BigInt(context.network.chainId),
      riskEngine: event.args.riskEngine,
      timelock: event.args.timelock,
      protocolId: event.args.protocolId,
      initialGovernor: event.args.initialGovernor,
    }),
    getOrCreateTx(event, context),
  ]);
});

ponder.on("Factory:PTokenDeployed", async ({ context, event }) => {
  const id = getUniqueContractId(context.network.chainId, event.args.pToken);

  const protocolIdDb = getProtocolId(
    event.log.address,
    context.network.chainId,
    event.args.protocolId
  );

  const protocolData = await context.db.find(protocol, {
    id: protocolIdDb,
  });

  if (!protocolData) {
    throw new Error("Protocol not found");
  }

  const riskEngine = protocolData.riskEngine;

  const pTokenInfo = await readPTokenInfo(
    context,
    event.args.pToken,
    riskEngine
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
      index: event.args.index,
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
    }),
    getOrCreateUnderlying(pTokenInfo.asset, context),
    getOrCreateTx(event, context),
  ]);
});
