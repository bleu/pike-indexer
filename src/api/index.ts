import { ponder } from 'ponder:registry';
import { eq, graphql } from 'ponder';
import { pToken, userBalance } from 'ponder:schema';
import { serializeObjWithBigInt } from '../utils/serialiaze';
import { MathSol } from '../utils/math';
import { formatEther } from 'viem';

ponder.use('/graphql', graphql());
ponder.use('/', graphql());

ponder.get('/balances/:userId', async c => {
  const userId = c.req.param('userId');

  const userBalancesWithPToken = await c.db
    .select()
    .from(userBalance)
    .where(eq(userBalance.userId, userId))
    .innerJoin(pToken, eq(userBalance.pTokenId, pToken.id));

  if (userBalancesWithPToken.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const res = userBalancesWithPToken.map(userBalance => {
    const storedBorrowAssets = MathSol.divDownFixed(
      MathSol.mulDownFixed(
        userBalance.user_balance.borrowAssets,
        userBalance.p_token.borrowIndex
      ),
      userBalance.user_balance.interestIndex
    );

    const supplyAssets = MathSol.mulDownFixed(
      userBalance.user_balance.supplyShares,
      userBalance.p_token.exchangeRateCurrent
    );

    return {
      ...userBalance,
      metrics: {
        storedBorrowAssets,
        supplyAssets,
        borrowUsdValue: formatEther(
          MathSol.mulDownFixed(
            storedBorrowAssets,
            userBalance.p_token.underlyingPriceCurrent
          )
        ),
        supplyUsdValue: formatEther(
          MathSol.mulDownFixed(
            supplyAssets,
            userBalance.p_token.underlyingPriceCurrent
          )
        ),
      },
    };
  });

  return c.json(serializeObjWithBigInt(res));
});
