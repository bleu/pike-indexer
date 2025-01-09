import { Context } from 'ponder:registry';
import { user } from 'ponder:schema';
import { getAddressId } from './id';
import { Address } from 'viem';

export async function getOrCreateUser(context: Context, address: Address) {
  const chainId = context.network.chainId;
  const userId = getAddressId(chainId, address);
  return await context.db
    .insert(user)
    .values({
      id: userId,
      chainId: BigInt(context.network.chainId),
      address,
    })
    .onConflictDoNothing();
}
