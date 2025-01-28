import { and, createClient, eq } from '@ponder/client';
import * as schema from '../../ponder-app/ponder.schema';
import {
  calculateNetMetrics,
  calculateUserMetricsOnProtocol,
  IUserMetricsData,
} from '@pike/utils';

export class PikeApiClient {
  public client;

  constructor(url: string) {
    this.client = createClient(url, { schema });
  }

  // This function is used to build a base query that fetches user data from the database to calculate metrics.
  // It joins the userBalance, pToken, userEMode, pTokenEMode, and eMode tables.
  private buildBaseUserQuery() {
    return this.client.db
      .select()
      .from(schema.userBalance)
      .innerJoin(
        schema.pToken,
        and(
          eq(schema.userBalance.pTokenId, schema.pToken.id),
          eq(schema.userBalance.chainId, schema.pToken.chainId)
        )
      )
      .leftJoin(
        schema.userEMode,
        and(
          eq(schema.userEMode.userId, schema.userBalance.userId),
          eq(schema.userEMode.chainId, schema.userBalance.chainId)
        )
      )
      .leftJoin(
        schema.pTokenEMode,
        and(
          eq(schema.pTokenEMode.pTokenId, schema.pToken.id),
          eq(schema.pTokenEMode.eModeId, schema.userEMode.eModeId),
          eq(schema.pTokenEMode.chainId, schema.userBalance.chainId)
        )
      )
      .leftJoin(
        schema.eMode,
        and(
          eq(schema.eMode.id, schema.userEMode.eModeId),
          eq(schema.eMode.chainId, schema.userBalance.chainId),
          eq(schema.eMode.protocolId, schema.pToken.protocolId)
        )
      );
  }

  // This function fetches user metrics for a given user ID.
  // It groups the data by protocol and calculates metrics for each protocol and pToken.
  // The metrics on the protocol level are then used to calculate net metrics.
  async getUserMetrics(userId: string) {
    const storedData = await this.buildBaseUserQuery().where(
      eq(schema.userBalance.userId, userId)
    );

    if (storedData.length === 0) {
      return;
    }

    // Group data by protocol
    const protocolGroups = storedData.reduce<{
      [key: string]: IUserMetricsData;
    }>((acc, row) => {
      const protocolId = row.pToken.protocolId;
      if (!acc[protocolId]) {
        acc[protocolId] = [];
      }
      acc[protocolId].push(row);
      return acc;
    }, {});

    const protocolMetrics = this.calculateProtocolMetrics(protocolGroups);

    const netMetrics = calculateNetMetrics(
      protocolMetrics.map(metrics => ({
        borrowAPY: metrics.netBorrowAPY,
        supplyAPY: metrics.netSupplyAPY,
        borrowUsdValue: metrics.netBorrowUsdValue,
        supplyUsdValue: metrics.netSupplyUsdValue,
      }))
    );

    return {
      protocolMetrics,
      netMetrics,
    };
  }

  // This function fetches user metrics for a given user ID and protocol ID.
  // It groups the data by PToken and calculates metrics for each pToken.
  // The pToken metrics are then used to calculate net protocol metrics.
  async getUserProtocolMetrics(userId: string, protocolId: string) {
    const storedData = await this.buildBaseUserQuery().where(
      and(
        eq(schema.userBalance.userId, userId),
        eq(schema.pToken.protocolId, protocolId)
      )
    );

    if (storedData.length === 0) {
      return;
    }

    return calculateUserMetricsOnProtocol(storedData);
  }

  private calculateProtocolMetrics(protocolGroups: {
    [key: string]: IUserMetricsData;
  }) {
    return Object.entries(protocolGroups).map(([protocolId, data]) => ({
      protocolId,
      ...calculateUserMetricsOnProtocol(data),
    }));
  }
}
