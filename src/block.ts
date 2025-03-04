import { Context, Event } from 'ponder:registry';
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
import { registerEvent } from './utils/eventRegister';

registerEvent(
  'CurrentPriceUpdate:block',
  async ({ context }: { context: Context }) => {
    // for some reason while using merge to do 1 SQL it return an error.
    // So I will do 2 SQLs to update the current price
    const [pTokens, protocols, underlyingTokens] = await Promise.all([
      context.db.sql
        .select()
        .from(pToken)
        .where(eq(pToken.chainId, BigInt(context.network.chainId))),
      context.db.sql
        .select()
        .from(protocol)
        .where(eq(protocol.chainId, BigInt(context.network.chainId))),
      context.db.sql
        .select()
        .from(underlyingToken)
        .where(eq(underlyingToken.chainId, BigInt(context.network.chainId))),
    ]);

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

    await Promise.all(
      newPricesInfo.map((newPriceInfo, index) => {
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
      })
    );
  }
);

registerEvent(
  'PriceSnapshotUpdate:block',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'PriceSnapshotUpdate:block'>;
  }) => {
    const pTokens = await context.db.sql
      .select()
      .from(pToken)
      .where(eq(pToken.chainId, BigInt(context.network.chainId)));

    const snapshotValues = pTokens.map(ptoken => ({
      id: `${ptoken.id}-${event.block.number}`,
      pTokenId: ptoken.id,
      price: ptoken.underlyingPriceCurrent,
      formattedPrice: ptoken.formattedUnderlyingPriceCurrent,
      timestamp: event.block.timestamp,
      chainId: BigInt(context.network.chainId),
    }));

    await context.db.insert(priceSnapshot).values(snapshotValues);
  }
);

registerEvent(
  'APRSnapshotUpdate:block',
  async ({
    context,
    event,
  }: {
    context: Context;
    event: Event<'APRSnapshotUpdate:block'>;
  }) => {
    const pTokens = await context.db.sql
      .select()
      .from(pToken)
      .where(eq(pToken.chainId, BigInt(context.network.chainId)));

    const snapshotValues = pTokens.map(ptoken => ({
      id: `${ptoken.id}-${event.block.number}`,
      pTokenId: ptoken.id,
      supplyRatePerSecond: ptoken.supplyRatePerSecond,
      borrowRatePerSecond: ptoken.borrowRatePerSecond,
      timestamp: event.block.timestamp,
      chainId: BigInt(context.network.chainId),
    }));

    await context.db.insert(aprSnapshot).values(snapshotValues);
  }
);
