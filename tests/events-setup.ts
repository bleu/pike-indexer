import { Context, Event } from 'ponder:registry';
import { pToken } from 'ponder:schema';
import { parseEther } from 'viem';
import { CONTRACT_ADDRESSES } from './addressBook';

export const setupPTokenBorrow = async ({
  context,
  event,
}: {
  context: Context;
  event: Event<'PToken:Borrow'>;
}) => {
  console.log('Setting up test database for PToken:Borrow event');

  const tokenAddress = event.log.address;
  const chainId = context.network.chainId;

  const tokenConfig = {
    index: 1n,
    underlying: '',
    symbol: 'pWETH',
    name: 'pike weth',
    supplyCap: BigInt('1000000000000000000000'),
    borrowCap: BigInt('1000000000000000000000'),
    formattedPrice: '3285',
  };

  const id = `${tokenAddress}-${chainId}`;
  const underlyingId = `${tokenConfig.underlying}-${chainId}`;
  const protocolId = `${CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES].riskEngine}-${chainId}`;

  await context.db.insert(pToken).values({
    id,
    address: tokenAddress,
    chainId: BigInt(chainId),
    protocolId: protocolId,
    index: tokenConfig.index,
    underlyingId: underlyingId,
    symbol: tokenConfig.symbol,
    name: tokenConfig.name,
    decimals: '8',
    liquidationThreshold: parseEther('0.825'),
    liquidationIncentive: parseEther('1.02'),
    reserveFactor: parseEther('0.01'),
    collateralFactor: parseEther('0.725'),
    protocolSeizeShare: parseEther('0.02'),
    closeFactor: parseEther('0.5'),
    supplyCap: tokenConfig.supplyCap,
    borrowCap: tokenConfig.borrowCap,
    creationTransactionId: `${event.transaction.hash}-${chainId}`,
    exchangeRateStored: BigInt(1000000000000000000),
    utilization: 0n,
    borrowRatePerSecond: 0n,
    supplyRatePerSecond: 0n,
    borrowRateAPY: '0',
    supplyRateAPY: '0',
    borrowIndex: parseEther('1'),
    cash: 0n,
    totalSupply: 1000000000000000000000000000000000000n,
    totalReserves: 1000000000000000000000000000000000000n,
    totalBorrows: 0n,
    isBorrowPaused: false,
    isMintPaused: false,
    isTransferPaused: false,
    isSeizePaused: false,
    underlyingPriceCurrent: parseEther(tokenConfig.formattedPrice),
    formattedUnderlyingPriceCurrent: tokenConfig.formattedPrice,
    totalBorrowUsdValue: '0',
    totalSupplyUsdValue: '0',
    updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    baseRatePerSecond: 0n,
    multiplierPerSecond: 0n,
    firstJumpMultiplierPerSecond: parseEther('0.000000061'),
    secondJumpMultiplierPerSecond: parseEther('0.000000006'),
    firstKink: parseEther('0.5'),
    secondKink: parseEther('0.95'),
  });

  console.log(`Added ${tokenConfig.symbol} record with ID: ${id}`);
};

export const setupPTokenDeposit = async ({
  context,
  event,
}: {
  context: Context;
  event: Event<'PToken:Deposit'>;
}) => {
  const tokenAddress = event.log.address;
  const chainId = context.network.chainId;

  const tokenConfig = {
    index: 1n,
    underlying: '',
    symbol: 'pWETH',
    name: 'pike weth',
    supplyCap: BigInt('1000000000000000000000'),
    borrowCap: BigInt('1000000000000000000000'),
    formattedPrice: '3285',
  };

  const id = `${tokenAddress}-${chainId}`;
  const underlyingId = `${tokenConfig.underlying}-${chainId}`;
  const protocolId = `${CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES].riskEngine}-${chainId}`;

  await context.db.insert(pToken).values({
    id,
    address: tokenAddress,
    chainId: BigInt(chainId),
    protocolId: protocolId,
    index: tokenConfig.index,
    underlyingId: underlyingId,
    symbol: tokenConfig.symbol,
    name: tokenConfig.name,
    decimals: '8',
    liquidationThreshold: parseEther('0.825'),
    liquidationIncentive: parseEther('1.02'),
    reserveFactor: parseEther('0.01'),
    collateralFactor: parseEther('0.725'),
    protocolSeizeShare: parseEther('0.02'),
    closeFactor: parseEther('0.5'),
    supplyCap: tokenConfig.supplyCap,
    borrowCap: tokenConfig.borrowCap,
    creationTransactionId: `${event.transaction.hash}-${chainId}`,
    exchangeRateStored: BigInt(1000000000000000000),
    utilization: 0n,
    borrowRatePerSecond: 0n,
    supplyRatePerSecond: 0n,
    borrowRateAPY: '0',
    supplyRateAPY: '0',
    borrowIndex: parseEther('1'),
    cash: 0n,
    totalSupply: 1000000000000000000000000000000000000n,
    totalReserves: 1000000000000000000000000000000000000n,
    totalBorrows: 0n,
    isBorrowPaused: false,
    isMintPaused: false,
    isTransferPaused: false,
    isSeizePaused: false,
    underlyingPriceCurrent: parseEther(tokenConfig.formattedPrice),
    formattedUnderlyingPriceCurrent: tokenConfig.formattedPrice,
    totalBorrowUsdValue: '0',
    totalSupplyUsdValue: '0',
    updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    baseRatePerSecond: 0n,
    multiplierPerSecond: 0n,
    firstJumpMultiplierPerSecond: parseEther('0.000000061'),
    secondJumpMultiplierPerSecond: parseEther('0.000000006'),
    firstKink: parseEther('0.5'),
    secondKink: parseEther('0.95'),
  });

  console.log(`Added ${tokenConfig.symbol} record with ID: ${id}`);
};

export const setupPTokenRepayBorrow = async ({
  context,
  event,
}: {
  context: Context;
  event: Event<'PToken:Deposit'>;
}) => {
  const tokenAddress = event.log.address;
  const chainId = context.network.chainId;

  const tokenConfig = {
    index: 1n,
    underlying: '',
    symbol: 'pWETH',
    name: 'pike weth',
    supplyCap: BigInt('1000000000000000000000'),
    borrowCap: BigInt('1000000000000000000000'),
    formattedPrice: '3285',
  };

  const id = `${tokenAddress}-${chainId}`;
  const underlyingId = `${tokenConfig.underlying}-${chainId}`;
  const protocolId = `${CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES].riskEngine}-${chainId}`;

  await context.db.insert(pToken).values({
    id,
    address: tokenAddress,
    chainId: BigInt(chainId),
    protocolId: protocolId,
    index: tokenConfig.index,
    underlyingId: underlyingId,
    symbol: tokenConfig.symbol,
    name: tokenConfig.name,
    decimals: '8',
    liquidationThreshold: parseEther('0.825'),
    liquidationIncentive: parseEther('1.02'),
    reserveFactor: parseEther('0.01'),
    collateralFactor: parseEther('0.725'),
    protocolSeizeShare: parseEther('0.02'),
    closeFactor: parseEther('0.5'),
    supplyCap: tokenConfig.supplyCap,
    borrowCap: tokenConfig.borrowCap,
    creationTransactionId: `${event.transaction.hash}-${chainId}`,
    exchangeRateStored: BigInt(1000000000000000000),
    utilization: 0n,
    borrowRatePerSecond: 0n,
    supplyRatePerSecond: 0n,
    borrowRateAPY: '0',
    supplyRateAPY: '0',
    borrowIndex: parseEther('1'),
    cash: 0n,
    totalSupply: 1000000000000000000000000000000000000n,
    totalReserves: 1000000000000000000000000000000000000n,
    totalBorrows: 0n,
    isBorrowPaused: false,
    isMintPaused: false,
    isTransferPaused: false,
    isSeizePaused: false,
    underlyingPriceCurrent: parseEther(tokenConfig.formattedPrice),
    formattedUnderlyingPriceCurrent: tokenConfig.formattedPrice,
    totalBorrowUsdValue: '0',
    totalSupplyUsdValue: '0',
    updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    baseRatePerSecond: 0n,
    multiplierPerSecond: 0n,
    firstJumpMultiplierPerSecond: parseEther('0.000000061'),
    secondJumpMultiplierPerSecond: parseEther('0.000000006'),
    firstKink: parseEther('0.5'),
    secondKink: parseEther('0.95'),
  });

  console.log(`Added ${tokenConfig.symbol} record with ID: ${id}`);
};

export const setupPTokenWithdraw = async ({
  context,
  event,
}: {
  context: Context;
  event: Event<'PToken:Deposit'>;
}) => {
  const tokenAddress = event.log.address;
  const chainId = context.network.chainId;

  const tokenConfig = {
    index: 1n,
    underlying: '',
    symbol: 'pWETH',
    name: 'pike weth',
    supplyCap: BigInt('1000000000000000000000'),
    borrowCap: BigInt('1000000000000000000000'),
    formattedPrice: '3285',
  };

  const id = `${tokenAddress}-${chainId}`;
  const underlyingId = `${tokenConfig.underlying}-${chainId}`;
  const protocolId = `${CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES].riskEngine}-${chainId}`;

  await context.db.insert(pToken).values({
    id,
    address: tokenAddress,
    chainId: BigInt(chainId),
    protocolId: protocolId,
    index: tokenConfig.index,
    underlyingId: underlyingId,
    symbol: tokenConfig.symbol,
    name: tokenConfig.name,
    decimals: '8',
    liquidationThreshold: parseEther('0.825'),
    liquidationIncentive: parseEther('1.02'),
    reserveFactor: parseEther('0.01'),
    collateralFactor: parseEther('0.725'),
    protocolSeizeShare: parseEther('0.02'),
    closeFactor: parseEther('0.5'),
    supplyCap: tokenConfig.supplyCap,
    borrowCap: tokenConfig.borrowCap,
    creationTransactionId: `${event.transaction.hash}-${chainId}`,
    exchangeRateStored: BigInt(1000000000000000000),
    utilization: 0n,
    borrowRatePerSecond: 0n,
    supplyRatePerSecond: 0n,
    borrowRateAPY: '0',
    supplyRateAPY: '0',
    borrowIndex: parseEther('1'),
    cash: 0n,
    totalSupply: 1000000000000000000000000000000000000n,
    totalReserves: 1000000000000000000000000000000000000n,
    totalBorrows: 0n,
    isBorrowPaused: false,
    isMintPaused: false,
    isTransferPaused: false,
    isSeizePaused: false,
    underlyingPriceCurrent: parseEther(tokenConfig.formattedPrice),
    formattedUnderlyingPriceCurrent: tokenConfig.formattedPrice,
    totalBorrowUsdValue: '0',
    totalSupplyUsdValue: '0',
    updatedAt: BigInt(Math.floor(Date.now() / 1000)),
    baseRatePerSecond: 0n,
    multiplierPerSecond: 0n,
    firstJumpMultiplierPerSecond: parseEther('0.000000061'),
    secondJumpMultiplierPerSecond: parseEther('0.000000006'),
    firstKink: parseEther('0.5'),
    secondKink: parseEther('0.95'),
  });

  console.log(`Added ${tokenConfig.symbol} record with ID: ${id}`);
};

export const eventSetups: Record<string, Function> = {
  PToken_Borrow: setupPTokenBorrow,
  PToken_Deposit: setupPTokenDeposit,
  PToken_RepayBorrow: setupPTokenRepayBorrow,
  PToken_Withdraw: setupPTokenWithdraw,
};
