import { ponder } from 'ponder:registry';
import { protocol, pToken } from 'ponder:schema';
import { readMultiplePTokenPricesInfo } from './utils/multicalls';
import { formatEther } from 'viem';
import { MathSol } from './utils/math';

ponder.on('CurrentPriceUpdate:block', async ({ context, event }) => {
  // for some reason while using merge to do 1 SQL it return an error.
  // So I will do 2 SQLs to update the current price
  const pTokens = await context.db.sql.select().from(pToken);

  // Then, fetch all protocols
  const protocols = await context.db.sql.select().from(protocol);

  // Merge the results based on protocolId
  const pTokenWithProtocol = pTokens
    .map(token => {
      const matchingProtocol = protocols.find(p => p.id === token.protocolId);
      return {
        p_token: token,
        protocol: matchingProtocol,
      };
    })
    .filter(result => result.protocol !== undefined); // Remove any unmatched results to mimic INNER JOIN

  const newPricesInfo = await readMultiplePTokenPricesInfo(
    context,
    // @ts-ignore
    pTokenWithProtocol
  );

  await Promise.all(
    newPricesInfo.map(newPriceInfo =>
      context.db
        .update(pToken, { id: newPriceInfo.pTokenId })
        .set(({ cash, totalBorrows }) => ({
          currentUnderlyingPrice: newPriceInfo.price,
          totalSupplyUsdValue: formatEther(
            MathSol.mulDownFixed(cash, newPriceInfo.price)
          ),
          totalBorrowsUsdValue: formatEther(
            MathSol.mulDownFixed(totalBorrows, newPriceInfo.price)
          ),
        }))
    )
  );
});
