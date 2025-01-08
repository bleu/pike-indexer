import { ponder } from "ponder:registry";
import { getOrCreateTx, getTxId } from "./utils/transaction";
import { actionPaused, protocol } from "ponder:schema";
import { getUniqueContractId } from "./utils/unique";
import { getActionPausedProtocolData } from "./utils/actionPaused";

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
