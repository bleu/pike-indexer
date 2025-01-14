import { eq, sql } from 'ponder';
import { ponder } from 'ponder:registry';
import { protocol, pToken } from 'ponder:schema';
import { readMultiplePTokenPricesInfo } from './utils/multicalls';

ponder.on('CurrentPriceUpdate:block', async ({ context, event }) => {
  const pTokenWithProtocol = await context.db.sql
    .select()
    .from(pToken)
    .innerJoin(protocol, eq(pToken.protocolId, protocol.id)); // SQL error handling the text columns

  const newPricesInfo = await readMultiplePTokenPricesInfo(
    context,
    pTokenWithProtocol
  );

  await Promise.all(
    newPricesInfo.map(newPriceInfo =>
      context.db
        .update(pToken, { id: newPriceInfo.pTokenId })
        .set({
          currentUnderlyingPrice: newPriceInfo.price,
        })
        .catch(error => {
          console.log('Error updating current price:', error.message);
          console.error(error.message);
        })
    )
  );
});
