import { ponder } from 'ponder:registry';
import { getAddressId } from './utils/id';
import { beaconProxy } from 'ponder:schema';

ponder.on('Beacon:Upgraded', async ({ context, event }) => {
  const beaconId = getAddressId(context.network.chainId, event.log.address);

  const params = {
    chainId: BigInt(context.network.chainId),
    beaconAddress: event.log.address,
    implementationAddress: event.args.implementation,
  };
  await context.db
    .insert(beaconProxy)
    .values({
      id: beaconId,
      ...params,
    })
    .onConflictDoUpdate(params);
});
