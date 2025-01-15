import { ponder } from 'ponder:registry';
import { and, eq, graphql } from 'ponder';
import { pToken, userBalance } from 'ponder:schema';
import { serializeObjWithBigInt } from '../utils/serialiaze';
import { calculateUserBalanceMetrics } from '../utils/calculations';
import { parseEther } from 'viem';
import { MathSol } from '../utils/math';

ponder.use('/graphql', graphql());
ponder.use('/', graphql());

ponder.get('/user/:userId/balances', async c => {
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
    const metrics = calculateUserBalanceMetrics(userBalance);

    return {
      ...userBalance,
      metrics,
    };
  });

  return c.json(serializeObjWithBigInt(res));
});

ponder.get(`user/:userId/balances/:pTokenId`, async c => {
  const userId = c.req.param('userId');
  const pTokenId = c.req.param('pTokenId');

  const userBalanceWithPToken = await c.db
    .select()
    .from(userBalance)
    .where(
      and(eq(userBalance.userId, userId), eq(userBalance.pTokenId, pTokenId))
    )
    .innerJoin(pToken, eq(userBalance.pTokenId, pToken.id))
    .limit(1);

  if (!userBalanceWithPToken[0]) {
    return c.json({ error: 'User balance not found' }, 404);
  }

  const metrics = calculateUserBalanceMetrics(userBalanceWithPToken[0]);

  return c.json(
    serializeObjWithBigInt({
      ...userBalanceWithPToken[0],
      metrics,
    })
  );
});

ponder.get(`/user/:userId`, async c => {
  const userId = c.req.param('userId');

  const userBalancesWithPToken = await c.db
    .select()
    .from(userBalance)
    .where(eq(userBalance.userId, userId))
    .innerJoin(pToken, eq(userBalance.pTokenId, pToken.id));

  if (userBalancesWithPToken.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const userBalances = userBalancesWithPToken.map(userBalance => {
    const metrics = calculateUserBalanceMetrics(userBalance);

    return {
      ...userBalance,
      metrics,
    };
  });

  const totalBorrowUsdValue = userBalances.reduce(
    (acc, { metrics }) => acc + parseEther(metrics.borrowUsdValue),
    0n
  );

  const totalSupplyUsdValue = userBalances.reduce(
    (acc, { metrics }) => acc + parseEther(metrics.supplyUsdValue),
    0n
  );

  const sumBorrowAPY = userBalances.reduce(
    (acc, { p_token, metrics }) =>
      acc +
      MathSol.mulDownFixed(
        parseEther(metrics.borrowUsdValue),
        parseEther(p_token.borrowRateAPY)
      ),
    0n
  );

  const sumSupplyAPY = userBalances.reduce(
    (acc, { p_token, metrics }) =>
      acc +
      MathSol.mulDownFixed(
        parseEther(metrics.supplyUsdValue),
        parseEther(p_token.supplyRateAPY)
      ),
    0n
  );

  const netBorrowAPY = MathSol.divDownFixed(sumBorrowAPY, totalBorrowUsdValue);
  const netSupplyAPY = MathSol.divDownFixed(sumSupplyAPY, totalSupplyUsdValue);
  const isNetAPYNegative = sumBorrowAPY < sumSupplyAPY;
  const netAPYValue = isNetAPYNegative
    ? MathSol.divDownFixed(sumBorrowAPY - sumSupplyAPY, totalSupplyUsdValue)
    : MathSol.divDownFixed(sumSupplyAPY - sumBorrowAPY, totalBorrowUsdValue);
  const netWorth = totalSupplyUsdValue - totalBorrowUsdValue;

  return c.json(
    serializeObjWithBigInt({
      metrics: {
        totalBorrowUsdValue,
        totalSupplyUsdValue,
        netBorrowAPY,
        netSupplyAPY,
        netAPYValue,
        netWorth,
        userBalances,
      },
      userBalances,
    })
  );
});
