import { ponder } from "ponder:registry";
import { protocol } from "ponder:schema";
import { getOrCreateTx, getTxId } from "./utils/transaction";
import { getUniqueContractId } from "./utils/unique";

ponder.on("Factory:ProtocolDeployed", async ({ context, event }) => {
  const id = getUniqueContractId(
    context.network.chainId,
    event.args.riskEngine
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
