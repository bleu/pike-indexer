import { ponder } from "ponder:registry";
import { getOrCreateTx } from "./utils/transaction";
import { actionPaused, protocol, pToken } from "ponder:schema";
import { getTxId, getUniqueContractId } from "./utils/id";
import { getActionPausedProtocolData } from "./utils/actionPaused";
import { readPTokenInfo } from "./utils/multicalls";
import { getOrCreateUnderlying } from "./utils/underlying";

ponder.on("RiskEngine:MarketListed", async ({ context, event }) => {
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
    }),
    getOrCreateUnderlying(pTokenInfo.asset, context),
    getOrCreateTx(event, context),
  ]);
});

ponder.on(
  "RiskEngine:ActionPaused(string action, bool pauseState)",
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
        action: event.args.action as "Mint" | "Borrow" | "Transfer" | "Seize",
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
