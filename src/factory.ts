import { ponder } from 'ponder:registry';
import { protocol, pToken } from 'ponder:schema';
import { getTransactionId, getAddressId } from './utils/id';
import { readProtocolInfo } from './utils/multicalls';
import { createIfNotExistsTransaction } from './utils/databaseWriteUtils';

ponder.on('Factory:ProtocolDeployed', async ({ context, event }) => {
  const id = getAddressId(context.network.chainId, event.args.riskEngine);
  const creationTransactionId = getTransactionId(event, context);

  const protocolInfo = await readProtocolInfo(
    context,
    event.args.riskEngine,
    event.log.address
  );

  await Promise.all([
    context.db.insert(protocol).values({
      id,
      creationTransactionId,
      chainId: BigInt(context.network.chainId),
      riskEngine: event.args.riskEngine,
      timelock: event.args.timelock,
      protocolId: event.args.protocolId,
      initialGovernor: event.args.initialGovernor,
      pTokenBeaconProxyId: getAddressId(
        context.network.chainId,
        protocolInfo.pTokenBeaconProxy
      ),
      //       riskEngineBeaconProxy: string;
      // timelockBeaconProxy: string;
      // oracleEngineBeaconProxy: string;
      riskEngineBeaconProxyId: getAddressId(
        context.network.chainId,
        protocolInfo.riskEngineBeaconProxy
      ),
      timelockBeaconProxyId: getAddressId(
        context.network.chainId,
        protocolInfo.timelockBeaconProxy
      ),
      initOracleEngineBeaconProxyId: getAddressId(
        context.network.chainId,
        protocolInfo.oracleEngineBeaconProxy
      ),
      ...protocolInfo,
    }),
    createIfNotExistsTransaction(event, context),
  ]);
});

ponder.on('Factory:PTokenDeployed', async ({ context, event }) => {
  // at this point the pToken entry was already created by the MarketListed event
  // we just have to include the index data
  await context.db
    .update(pToken, {
      id: getAddressId(context.network.chainId, event.args.pToken),
    })
    .set({
      index: event.args.index,
      updatedAt: event.block.timestamp,
    })
    .catch(e => {
      console.error(e);
    });
});
