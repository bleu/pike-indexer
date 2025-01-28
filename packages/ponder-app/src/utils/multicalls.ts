import { Context } from 'ponder:registry';
import { Address, erc20Abi } from 'viem';
import {
  PTokenAbi,
  RiskEngineAbi,
  OracleEngineAbi,
  FactoryAbi,
} from '@pike/utils';
import { protocol, pToken } from 'ponder:schema';

export async function readMultiplePTokenPricesInfo(
  context: Context,
  data: {
    pToken: typeof pToken.$inferSelect;
    protocol: typeof protocol.$inferSelect;
  }[]
) {
  const res = await context.client.multicall({
    contracts: data.map(({ pToken, protocol }) => ({
      address: protocol.oracle,
      abi: OracleEngineAbi,
      functionName: 'getUnderlyingPrice',
      args: [pToken.address],
    })),
  });

  return res.map((r, i) => ({
    pTokenId: data[i]?.pToken.id as Address,
    price: BigInt(r.result || '0') as bigint,
  }));
}

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
  riskEngine: Address
) {
  const riskEngineContract = {
    address: riskEngine,
    abi: RiskEngineAbi,
  } as const;

  const pTokenContract = {
    address: pToken,
    abi: PTokenAbi,
  } as const;

  const res = await context.client.multicall({
    contracts: [
      {
        ...pTokenContract,
        functionName: 'name',
      },
      {
        ...pTokenContract,
        functionName: 'symbol',
      },
      {
        ...pTokenContract,
        functionName: 'decimals',
      },
      {
        ...pTokenContract,
        functionName: 'protocolSeizeShareMantissa',
      },
      {
        ...pTokenContract,
        functionName: 'exchangeRateCurrent',
      },
      {
        ...pTokenContract,
        functionName: 'borrowRatePerSecond',
      },
      {
        ...pTokenContract,
        functionName: 'supplyRatePerSecond',
      },
      {
        ...pTokenContract,
        functionName: 'asset',
      },
      {
        ...riskEngineContract,
        functionName: 'collateralFactor',
        args: [0, pToken],
      },
      {
        ...riskEngineContract,
        functionName: 'liquidationThreshold',
        args: [0, pToken],
      },
      {
        ...riskEngineContract,
        functionName: 'liquidationIncentive',
        args: [0, pToken],
      },
      {
        ...riskEngineContract,
        functionName: 'closeFactor',
        args: [pToken],
      },
      {
        ...riskEngineContract,
        functionName: 'supplyCap',
        args: [pToken],
      },
      {
        ...riskEngineContract,
        functionName: 'borrowCap',
        args: [pToken],
      },
      {
        ...pTokenContract,
        functionName: 'reserveFactorMantissa',
      },
      {
        ...pTokenContract,
        functionName: 'borrowIndex',
      },
      {
        ...pTokenContract,
        functionName: 'baseRatePerSecond',
      },
      {
        ...pTokenContract,
        functionName: 'multipliers',
      },
      {
        ...pTokenContract,
        functionName: 'kinks',
      },
    ],
  });

  if (res.some(r => r.error || r.result === undefined || r.result === null)) {
    throw new Error('Failed to fetch PToken information');
  }

  return {
    name: res[0].result as string,
    symbol: res[1].result as string,
    decimals: `${res[2].result as number}`,
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
    baseRatePerSecond: res[16].result as bigint,
    multiplierPerSecond: res[17].result?.[0] as bigint,
    firstJumpMultiplierPerSecond: res[17].result?.[1] as bigint,
    secondJumpMultiplierPerSecond: res[17].result?.[2] as bigint,
    firstKink: res[18].result?.[0] as bigint,
    secondKink: res[18].result?.[1] as bigint,
  };
}

export async function readProtocolInfo(
  context: Context,
  riskEngine: Address,
  factory: Address
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
      {
        address: factory,
        abi: FactoryAbi,
        functionName: 'pTokenBeacon',
      },
      {
        address: factory,
        abi: FactoryAbi,
        functionName: 'riskEngineBeacon',
      },
      {
        address: factory,
        abi: FactoryAbi,
        functionName: 'timelockBeacon',
      },
      {
        address: factory,
        abi: FactoryAbi,
        functionName: 'oracleEngineBeacon',
      },
    ],
  });

  if (res.some(r => r.error || r.result === undefined || r.result === null)) {
    throw new Error('Failed to fetch Protocol information');
  }

  const shares = res[0].result as [bigint, bigint];

  return {
    configuratorShare: shares[0],
    ownerShare: shares[1],
    oracle: res[1].result as Address,
    pTokenBeaconProxy: res[2].result as string,
    riskEngineBeaconProxy: res[3].result as string,
    timelockBeaconProxy: res[4].result as string,
    oracleEngineBeaconProxy: res[5].result as string,
  };
}
