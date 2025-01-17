import { ponder } from 'ponder:registry';
import { and, eq, graphql } from 'ponder';
import {
  eMode,
  pToken,
  pTokenEMode,
  userBalance,
  userEMode,
} from 'ponder:schema';
import { serializeObjWithBigInt } from '../utils/serialiaze';
import { calculateUserBalanceMetrics } from '../utils/calculations';
import { formatEther, parseEther } from 'viem';
import { MathSol } from '../utils/math';

ponder.use('/graphql', graphql());
ponder.use('/', graphql());

ponder.get('/user/:userId/balances', async c => {
  const userId = c.req.param('userId');

  const userBalancesWithPToken = await c.db
    .select()
    .from(userBalance)
    .innerJoin(pToken, eq(userBalance.pTokenId, pToken.id))
    .where(eq(userBalance.userId, userId));

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
    .innerJoin(pToken, eq(userBalance.pTokenId, pToken.id))
    .where(
      and(eq(userBalance.userId, userId), eq(userBalance.pTokenId, pTokenId))
    )
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

  const data = await c.db
    .select()
    .from(userBalance)
    .innerJoin(
      pToken,
      and(
        eq(userBalance.pTokenId, pToken.id),
        eq(userBalance.chainId, pToken.chainId)
      )
    )
    .leftJoin(
      userEMode,
      and(
        eq(userEMode.userId, userBalance.userId),
        eq(userEMode.chainId, userBalance.chainId)
      )
    )
    .leftJoin(
      pTokenEMode,
      and(
        eq(pTokenEMode.pTokenId, pToken.id),
        eq(pTokenEMode.eModeId, userEMode.eModeId),
        eq(pTokenEMode.chainId, userBalance.chainId)
      )
    )
    .leftJoin(
      eMode,
      and(
        eq(eMode.id, userEMode.eModeId),
        eq(eMode.chainId, userBalance.chainId),
        eq(eMode.protocolId, pToken.protocolId)
      )
    )
    .where(and(eq(userBalance.userId, userId)));

  if (data.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const userBalances = data.map(d => {
    const metrics = calculateUserBalanceMetrics(d);

    return {
      ...d,
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

  const totalCollateralWithLiquidationThreshold = userBalances.reduce(
    (acc, { metrics, e_mode, p_token, user_balance }) => {
      if (!user_balance.isCollateral) return acc;

      const liquidationThreshold = e_mode
        ? e_mode.liquidationThreshold
        : p_token.liquidationThreshold;

      return (
        acc +
        MathSol.divDownFixed(
          parseEther(metrics.supplyUsdValue),
          liquidationThreshold
        )
      );
    },
    0n
  );

  const healthIndex = MathSol.divDownFixed(
    totalCollateralWithLiquidationThreshold,
    totalBorrowUsdValue
  );

  const netBorrowAPY = MathSol.divDownFixed(sumBorrowAPY, totalBorrowUsdValue);

  const netSupplyAPY = MathSol.divDownFixed(sumSupplyAPY, totalSupplyUsdValue);

  const isNetAPYNegative = sumBorrowAPY > sumSupplyAPY;

  const netAPYValue = isNetAPYNegative
    ? MathSol.divDownFixed(sumBorrowAPY - sumSupplyAPY, totalBorrowUsdValue)
    : MathSol.divDownFixed(sumSupplyAPY - sumBorrowAPY, totalSupplyUsdValue);

  const netWorth = totalSupplyUsdValue - totalBorrowUsdValue;

  return c.json(
    serializeObjWithBigInt({
      metrics: {
        totalBorrowUsdValue: formatEther(totalBorrowUsdValue),
        totalSupplyUsdValue: formatEther(totalSupplyUsdValue),
        netBorrowAPY: formatEther(netBorrowAPY),
        netSupplyAPY: formatEther(netSupplyAPY),
        netAPYValue: formatEther(netAPYValue),
        netWorth: formatEther(netWorth),
        healthIndex: formatEther(healthIndex),
      },
      userBalances,
    })
  );
});
