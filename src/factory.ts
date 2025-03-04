import { Context, Event } from 'ponder:registry';
import { protocol, pToken } from 'ponder:schema';
import { getTransactionId, getAddressId } from './utils/id';
import { readProtocolInfo } from './utils/multicalls';
import { createIfNotExistsTransaction } from './utils/databaseWriteUtils';
import { registerEvent } from './utils/eventRegister';

export async function handleProtocolDeployed({
  context,
  event,
}: {
  context: Context;
  event: Event<
    | 'Factory:ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)'
    | 'Factory:ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address oracleEngine, address initialGovernor)'
  >;
}) {
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
      ...protocolInfo,
    }),
    createIfNotExistsTransaction(event, context),
  ]);
}

registerEvent(
  'Factory:ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address initialGovernor)',
  handleProtocolDeployed,
  'Factory_ProtocolDeployed_V0'
);

registerEvent(
  'Factory:ProtocolDeployed(uint256 indexed protocolId, address indexed riskEngine, address indexed timelock, address oracleEngine, address initialGovernor)',
  handleProtocolDeployed,
  'Factory_ProtocolDeployed_V1'
);

registerEvent(
  'Factory:PTokenDeployed',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'Factory:PTokenDeployed'>;
  }) => {
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
  }
);
