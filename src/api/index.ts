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
import {
  calculateNetMetrics,
  calculateUserMetricsOnProtocol,
} from '../utils/calculations';
import { UserProtocolPTokenQueryResult } from '../utils/types';

ponder.use('/graphql', graphql());
ponder.use('/', graphql());

ponder.get(`/user/:userId/metrics`, async c => {
  const userId = c.req.param('userId');

  // Fetch all user balances and related data across all protocols
  const storedData = await c.db
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
    .where(eq(userBalance.userId, userId));

  if (storedData.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  // Group data by protocol
  const protocolGroups = storedData.reduce<{
    [key: string]: UserProtocolPTokenQueryResult[];
  }>((acc, row) => {
    const protocolId = row.p_token.protocolId;
    if (!acc[protocolId]) {
      acc[protocolId] = [];
    }
    acc[protocolId].push(row);
    return acc;
  }, {});

  // Calculate metrics for each protocol
  const protocolMetrics = Object.entries(protocolGroups).map(
    ([protocolId, data]) => ({
      protocolId,
      ...calculateUserMetricsOnProtocol(data),
    })
  );

  const netMetrics = calculateNetMetrics(
    protocolMetrics.map(metrics => ({
      borrowAPY: metrics.netBorrowAPY,
      supplyAPY: metrics.netSupplyAPY,
      borrowUsdValue: metrics.netBorrowUsdValue,
      supplyUsdValue: metrics.netSupplyUsdValue,
    }))
  );

  return c.json(
    serializeObjWithBigInt({
      protocolMetrics,
      netMetrics,
    })
  );
});

ponder.get(`/user/:userId/protocol/:protocolId/metrics`, async c => {
  const userId = c.req.param('userId');
  const protocolId = c.req.param('protocolId');

  const storedData = await c.db
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
    .where(
      and(eq(userBalance.userId, userId), eq(pToken.protocolId, protocolId))
    );

  if (storedData.length === 0) {
    return c.json({ error: 'User not found' }, 404);
  }

  const metrics = calculateUserMetricsOnProtocol(storedData);

  return c.json(
    serializeObjWithBigInt({
      metrics,
    })
  );
});
