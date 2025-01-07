import { ponder } from 'ponder:registry';
import { protocol, pToken } from 'ponder:schema';
import { getOrCreateTx } from './utils/transaction';
import { getTxId, getUniqueContractId } from './utils/id';
import { readProtocolInfo } from './utils/multicalls';

ponder.on('Factory:ProtocolDeployed', async ({ context, event }) => {
  const id = getUniqueContractId(
    context.network.chainId,
    event.args.riskEngine
  );
  const creationTransactionId = getTxId(event, context);

  const protocolInfo = await readProtocolInfo(context, event.args.riskEngine);

  await Promise.all([
    context.db.insert(protocol).values({
      id,
      creationTransactionId,
      chainId: BigInt(context.network.chainId),
      riskEngine: event.args.riskEngine,
      timelock: event.args.timelock,
      protocolId: event.args.protocolId,
      initialGovernor: event.args.initialGovernor,
      ...protocolInfo,
    }),
    getOrCreateTx(event, context),
  ]);
});

ponder.on('Factory:PTokenDeployed', async ({ context, event }) => {
  // at this point the pToken entry was already created by the MarketListed event
  // we just have to include the index data
  await context.db
    .update(pToken, {
      id: getUniqueContractId(context.network.chainId, event.args.pToken),
    })
    .set({
      index: event.args.index,
    });
});
