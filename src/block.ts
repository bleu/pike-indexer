import { ponder } from 'ponder:registry';
import {
  aprSnapshot,
  priceSnapshot,
  protocol,
  pToken,
  underlyingToken,
} from 'ponder:schema';
import { readMultiplePTokenPricesInfo } from './utils/multicalls';
import { calculateUsdValueFromAssets } from './utils/calculations';
import { formatUnits } from 'viem';
import { eq } from 'ponder';

ponder.on('CurrentPriceUpdate:block', async ({ context, event }) => {
  // for some reason while using merge to do 1 SQL it return an error.
  // So I will do 2 SQLs to update the current price
  const pTokens = await context.db.sql
    .select()
    .from(pToken)
    .where(eq(pToken.chainId, BigInt(context.network.chainId)));

  const protocols = await context.db.sql
    .select()
    .from(protocol)
    .where(eq(protocol.chainId, BigInt(context.network.chainId)));

  const underlyingTokens = await context.db.sql
    .select()
    .from(underlyingToken)
    .where(eq(underlyingToken.chainId, BigInt(context.network.chainId)));

  // Merge the results based on protocolId
  const pTokenWithProtocol = pTokens
    .map(token => {
      const matchingProtocol = protocols.find(p => p.id === token.protocolId);
      const underlyingToken = underlyingTokens.find(
        u => u.id === token.underlyingId
      );
      return {
        pToken: token,
        protocol: matchingProtocol,
        underlyingToken,
      };
    })
    .filter(
      result =>
        result.protocol !== undefined || result.underlyingToken !== undefined
    ); // Remove any unmatched results to mimic INNER JOIN

  const newPricesInfo = await readMultiplePTokenPricesInfo(
    context,
    // @ts-ignore
    pTokenWithProtocol
  );

  const priceSnapshotValues = pTokens.map(ptoken => ({
    id: `${ptoken.id}-${event.block.number}`,
    pTokenId: ptoken.id,
    price: ptoken.underlyingPriceCurrent,
    formattedPrice: ptoken.formattedUnderlyingPriceCurrent,
    timestamp: event.block.timestamp,
    chainId: BigInt(context.network.chainId),
  }));

  const aprSnapshotValues = pTokens.map(ptoken => ({
    id: `${ptoken.id}-${event.block.number}`,
    pTokenId: ptoken.id,
    supplyRatePerSecond: ptoken.supplyRatePerSecond,
    borrowRatePerSecond: ptoken.borrowRatePerSecond,
    timestamp: event.block.timestamp,
    chainId: BigInt(context.network.chainId),
  }));

  await Promise.all([
    context.db.insert(aprSnapshot).values(aprSnapshotValues),
    context.db.insert(priceSnapshot).values(priceSnapshotValues),
    ...newPricesInfo.map((newPriceInfo, index) => {
      const underlyingTokenDecimals = Number(
        pTokenWithProtocol[index]?.underlyingToken?.decimals
      );

      context.db
        .update(pToken, { id: newPriceInfo.pTokenId })
        .set(({ cash, totalBorrows }) => ({
          underlyingPriceCurrent: newPriceInfo.price,
          totalSupplyUsdValue: calculateUsdValueFromAssets(
            cash,
            newPriceInfo.price
          ),
          formattedUnderlyingPriceCurrent: formatUnits(
            newPriceInfo.price,
            36 - underlyingTokenDecimals
          ),
          totalBorrowsUsdValue: calculateUsdValueFromAssets(
            totalBorrows,
            newPriceInfo.price
          ),
        }));
    }),
  ]);
});
