import { ponder } from "ponder:registry";
import { getUniqueAddressId } from "./utils/id";
import { pToken } from "ponder:schema";

ponder.on("PToken:NewRiskEngine", async ({ context, event }) => {
  await context.db
    .update(pToken, {
      id: getUniqueAddressId(context.network.chainId, event.log.address),
    })
    .set({
      protocolId: getUniqueAddressId(
        context.network.chainId,
        event.args.newRiskEngine
      ),
    })
    .catch((error) => {
      console.error(error.message);
    });
});

ponder.on("PToken:NewReserveFactor", async ({ context, event }) => {
  await context.db
    .update(pToken, {
      id: getUniqueAddressId(context.network.chainId, event.log.address),
    })
    .set({
      reserveFactor: event.args.newReserveFactorMantissa,
    })
    .catch((error) => {
      console.error(error.message);
    });
});

ponder.on("PToken:NewProtocolSeizeShare", async ({ context, event }) => {
  await context.db
    .update(pToken, {
      id: getUniqueAddressId(context.network.chainId, event.log.address),
    })
    .set({
      protocolSeizeShare: event.args.newProtocolSeizeShareMantissa,
    })
    .catch((error) => {
      console.error(error.message);
    });
});
