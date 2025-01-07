import { Context } from "ponder:registry";
import { user } from "ponder:schema";
import { getUniqueAddressId } from "./id";
import { Address } from "viem";

export async function getOrCreateUser(context: Context, address: Address) {
  const chainId = context.network.chainId;
  const userId = getUniqueAddressId(chainId, address);
  return await context.db
    .insert(user)
    .values({
      id: userId,
      chainId: BigInt(context.network.chainId),
      address,
    })
    .onConflictDoNothing();
}
