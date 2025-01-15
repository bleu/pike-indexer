import { ponder } from 'ponder:registry';
import { aprSnapshot, priceSnapshot, protocol, pToken } from 'ponder:schema';
import { readMultiplePTokenPricesInfo } from './utils/multicalls';
import { formatEther } from 'viem';
import { MathSol } from './utils/math';

ponder.on('CurrentPriceUpdate:block', async ({ context, event }) => {
  // for some reason while using merge to do 1 SQL it return an error.
  // So I will do 2 SQLs to update the current price
  const [pTokens, protocols] = await Promise.all([
    context.db.sql.select().from(pToken),
    context.db.sql.select().from(protocol),
  ]);

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
          underlyingPriceCurrent: newPriceInfo.price,
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

ponder.on('PriceSnapshotUpdate:block', async ({ context, event }) => {
  const pTokens = await context.db.sql.select().from(pToken);

  const snapshotValues = pTokens.map(ptoken => ({
    id: `${ptoken.id}-${event.block.number}`,
    pTokenId: ptoken.id,
    price: ptoken.underlyingPriceCurrent,
    timestamp: event.block.timestamp,
    chainId: BigInt(context.network.chainId),
  }));

  await context.db.insert(priceSnapshot).values(snapshotValues);
});

ponder.on('APRSnapshotUpdate:block', async ({ context, event }) => {
  const pTokens = await context.db.sql.select().from(pToken);

  const snapshotValues = pTokens.map(ptoken => ({
    id: `${ptoken.id}-${event.block.number}`,
    pTokenId: ptoken.id,
    supplyRatePerSecond: ptoken.supplyRatePerSecond,
    borrowRatePerSecond: ptoken.borrowRatePerSecond,
    timestamp: event.block.timestamp,
    chainId: BigInt(context.network.chainId),
  }));

  await context.db.insert(aprSnapshot).values(snapshotValues);
});
