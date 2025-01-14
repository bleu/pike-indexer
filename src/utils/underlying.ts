import { Context, Event } from 'ponder:registry';
import { Address } from 'viem';
import { getAddressId } from './id';
import { underlyingToken } from 'ponder:schema';
import { readErc20Information } from './multicalls';

export async function createIfNotExistsUnderlying(
  address: Address,
  context: Context
) {
  const underlyingId = getAddressId(context.network.chainId, address);

  const underlying = await context.db.find(underlyingToken, {
    id: underlyingId,
  });

  if (underlying) {
    return underlying;
  }

  const underlyingErc20Data = await readErc20Information(context, address);

  const underlyingValue = {
    id: underlyingId,
    chainId: BigInt(context.network.chainId),
    address,
    name: underlyingErc20Data.name,
    symbol: underlyingErc20Data.symbol,
    decimals: underlyingErc20Data.decimals.toString(),
  };

  return await context.db
    .insert(underlyingToken)
    .values(underlyingValue)
    .onConflictDoUpdate(underlyingValue);
}
