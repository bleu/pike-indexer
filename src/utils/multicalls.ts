import { Context } from 'ponder:registry';
import { Address, erc20Abi } from 'viem';
import { PTokenAbi } from '../../abis/PTokenAbi';
import { RiskEngineAbi } from '../../abis/RiskEngineAbi';
import { OracleEngineAbi } from '../../abis/OracleEngineAbi';

export async function readErc20Information(
  context: Context,
  address: `0x${string}`
) {
  const [nameResult, symbolResult, decimalsResult] =
    await context.client.multicall({
      contracts: [
        {
          address,
          abi: erc20Abi,
          functionName: 'name',
        },
        {
          address,
          abi: erc20Abi,
          functionName: 'symbol',
        },
        {
          address,
          abi: erc20Abi,
          functionName: 'decimals',
        },
      ],
    });

  if (nameResult.error || symbolResult.error || decimalsResult.error) {
    throw new Error('Failed to fetch ERC20 information');
  }

  return {
    name: nameResult.result,
    symbol: symbolResult.result,
    decimals: decimalsResult.result,
  };
}

export async function readPTokenInfo(
  context: Context,
  pToken: Address,
  riskEngine: Address,
  oracleEngine: Address
) {
  const res = await context.client.multicall({
    contracts: [
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'name',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'symbol',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'decimals',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'protocolSeizeShareMantissa',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'exchangeRateCurrent',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'borrowRatePerSecond',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'supplyRatePerSecond',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'asset',
      },
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'collateralFactor',
        args: [0, pToken],
      },
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'liquidationThreshold',
        args: [0, pToken],
      },
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'liquidationIncentive',
        args: [0, pToken],
      },
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'closeFactor',
        args: [pToken],
      },
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'supplyCap',
        args: [pToken],
      },
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'borrowCap',
        args: [pToken],
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'reserveFactorMantissa',
      },
      {
        address: pToken,
        abi: PTokenAbi,
        functionName: 'borrowIndex',
      },
      {
        address: oracleEngine,
        abi: OracleEngineAbi,
        functionName: 'getUnderlyingPrice',
        args: [pToken],
      },
    ],
  });

  if (res.some(r => r.error || r.result === undefined || r.result === null)) {
    throw new Error('Failed to fetch PToken information');
  }

  return {
    name: res[0].result as string,
    symbol: res[1].result as string,
    decimals: res[2].result as number,
    protocolSeizeShare: res[3].result as bigint,
    exchangeRateCurrent: res[4].result as bigint,
    borrowRatePerSecond: res[5].result as bigint,
    supplyRatePerSecond: res[6].result as bigint,
    asset: res[7].result as Address,
    collateralFactor: res[8].result as bigint,
    liquidationThreshold: res[9].result as bigint,
    liquidationIncentive: res[10].result as bigint,
    closeFactor: res[11].result as bigint,
    supplyCap: res[12].result as bigint,
    borrowCap: res[13].result as bigint,
    reserveFactor: res[14].result as bigint,
    borrowIndex: res[15].result as bigint,
    underlyingPrice: res[16].result as bigint,
  };
}

export async function readProtocolInfo(
  context: Context,
  riskEngine: `0x${string}`
) {
  const res = await context.client.multicall({
    contracts: [
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'getReserveShares',
      },
      {
        address: riskEngine,
        abi: RiskEngineAbi,
        functionName: 'oracle',
      },
    ],
  });

  if (res.some(r => r.error || r.result === undefined || r.result === null)) {
    throw new Error('Failed to fetch Protocol information');
  }

  const shares = res[0].result as [bigint, bigint];

  return {
    // configuratorShare: t.bigint().notNull(),
    // ownerShare: t.bigint().notNull(),
    // oracle: t.hex().notNull(),
    configuratorShare: shares[0],
    ownerShare: shares[1],
    oracle: res[1].result as `0x${string}`,
  };
}
