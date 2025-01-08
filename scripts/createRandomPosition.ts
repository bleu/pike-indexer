import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  Address,
  PublicClient,
  WalletClient,
  Account,
  encodeFunctionData,
} from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';
import { MockTokenAbi } from './abis/MockTokenAbi';
import { RiskEngineAbi } from '../abis/RiskEngineAbi';
import { PTokenAbi } from '../abis/PTokenAbi';
import { resolve } from 'path';
import { min, MathSol } from '../src/utils/math';

// Load environment variables from .env.local if it exists
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Environment validation
const requiredEnvVars = [
  'FUNDING_PRIVATE_KEY',
  'RISK_ENGINE_ADDRESS',
  'STETH_ADDRESS',
  'USDC_ADDRESS',
  'WETH_ADDRESS',
  'PSTETH_ADDRESS',
  'PUSDC_ADDRESS',
  'PWETH_ADDRESS',
  'STETH_PRICE',
  'USDC_PRICE',
  'WETH_PRICE',
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

interface TokenInfo {
  address: Address;
  pTokenAddress: Address;
  price: bigint;
  decimals: bigint;
}

interface UserPosition {
  deposited: bigint;
  borrowed: bigint;
  inMarket: boolean;
  underlyingBalance: bigint;
}

type TokenPositions = Record<Address, UserPosition>;

type TokenKey = 'steth' | 'usdc' | 'weth';

type Action = 'borrow' | 'withdraw' | 'deposit' | 'repay';

interface TokenConfig extends Record<TokenKey, TokenInfo> {}

// Configuration
const config = {
  fundingKey: process.env.FUNDING_PRIVATE_KEY!,
  riskEngine: process.env.RISK_ENGINE_ADDRESS as Address,
  tokens: {
    steth: {
      address: process.env.STETH_ADDRESS as Address,
      pTokenAddress: process.env.PSTETH_ADDRESS as Address,
      price: BigInt(process.env.STETH_PRICE!),
      decimals: 18n,
    },
    usdc: {
      address: process.env.USDC_ADDRESS as Address,
      pTokenAddress: process.env.PUSDC_ADDRESS as Address,
      price: BigInt(process.env.USDC_PRICE!),
      decimals: 6n,
    },
    weth: {
      address: process.env.WETH_ADDRESS as Address,
      pTokenAddress: process.env.PWETH_ADDRESS as Address,
      price: BigInt(process.env.WETH_PRICE!),
      decimals: 18n,
    },
  } satisfies TokenConfig,
};

const getRandomAmount = (min: bigint, max: bigint): bigint => {
  // Convert to number for Math.random() calculation, being careful of BigInt range
  // First get the range as a BigInt
  const range = max - min + 1n;

  // Convert to Number, generate random value, then back to BigInt
  const randomBigInt = BigInt(Math.floor(Math.random() * Number(range)));

  // Add to min to get final value
  return min + randomBigInt;
};

const shouldContinue = (): boolean => {
  return Math.random() > 0.2;
};

const getPossibleActions = (
  positions: TokenPositions,
  token: Address
): Action[] => {
  const position = positions[token] as UserPosition;
  const possibleActions: Action[] = [];

  if (position.underlyingBalance > 0n) {
    possibleActions.push('deposit');
  }

  if (position.deposited > 0n) {
    possibleActions.push('withdraw');
  }

  if (position.borrowed > 0n) {
    possibleActions.push('repay');
  }

  const allPositions = Object.values(positions);
  if (
    allPositions.some(position => position.inMarket && position.deposited > 0n)
  ) {
    possibleActions.push('borrow');
  }

  return possibleActions;
};

const getRandomToken = (): TokenInfo => {
  const tokens = Object.values(config.tokens);

  return tokens[Math.floor(Math.random() * tokens.length)] as TokenInfo;
};

const getRandomAction = (positions: TokenPositions, token: Address): Action => {
  const possibleActions = getPossibleActions(positions, token);

  return possibleActions[
    Math.floor(Math.random() * possibleActions.length)
  ] as Action;
};

class PositionCreator {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private account: Account;
  private fundingAccount: Account;
  private positions: TokenPositions;

  constructor() {
    // Create random wallet
    const randomPrivateKey = generatePrivateKey();
    this.account = privateKeyToAccount(randomPrivateKey);

    // Create funding account from env
    this.fundingAccount = privateKeyToAccount(
      config.fundingKey as `0x${string}`
    );

    // @ts-ignore
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    this.walletClient = createWalletClient({
      chain: baseSepolia,
      transport: http(),
    });

    this.positions = Object.values(config.tokens).reduce<TokenPositions>(
      (acc, token) => ({
        ...acc,
        [token.address]: {
          deposited: 0n,
          borrowed: 0n,
          inMarket: false,
        },
      }),
      {} as TokenPositions
    );

    console.log(`Generated random wallet address: ${this.account.address}`);
  }

  private calculateTotalCollateralValue(): bigint {
    return Object.entries(this.positions).reduce(
      (total, [address, position]) => {
        const token = Object.values(config.tokens).find(
          t => t.address === address
        );
        if (!token || !position.inMarket) return total;
        return total + MathSol.mulDownFixed(position.deposited, token.price);
      },
      0n
    );
  }

  private calculateTotalBorrowedValue(): bigint {
    return Object.entries(this.positions).reduce(
      (total, [address, position]) => {
        const token = Object.values(config.tokens).find(
          t => t.address === address
        );
        if (!token) return total;
        return total + MathSol.mulDownFixed(position.borrowed, token.price);
      },
      0n
    );
  }

  private getAvailableAmount(): bigint {
    const totalCollateralValue = this.calculateTotalCollateralValue();
    const totalBorrowedValue = this.calculateTotalBorrowedValue();

    return (
      // for simplicity we assume the liquidation threshold is 0.5
      MathSol.divDownFixed(totalCollateralValue, parseEther('2')) -
      totalBorrowedValue
    );
  }

  async sendInitialEth() {
    // Send from funding account
    const hash = await this.walletClient.sendTransaction({
      account: this.fundingAccount,
      to: this.account.address,
      value: parseEther('0.0001'),
      chain: baseSepolia,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(
      `Sent initial ETH from ${this.fundingAccount.address} to ${this.account.address}`
    );
  }

  async getNonce(address: Address): Promise<number> {
    return await this.publicClient.getTransactionCount({
      address,
    });
  }

  async sendTransaction(params: any) {
    const address = this.account.address;
    const nonce = await this.getNonce(address);
    return await this.walletClient.sendTransaction({
      ...params,
      nonce,
    });
  }

  async mintAllTokens() {
    for (const tokenInfo of Object.values(config.tokens)) {
      const hash = await this.sendTransaction({
        account: this.account,
        to: tokenInfo.address,
        value: 0n,
        chain: baseSepolia,
        data: encodeFunctionData({
          abi: MockTokenAbi,
          functionName: 'mint',
        }),
      });
      await this.publicClient.waitForTransactionReceipt({ hash });
      const position = this.positions[tokenInfo.address] as UserPosition;

      const balanceResult = await this.publicClient.readContract({
        address: tokenInfo.address,
        abi: MockTokenAbi,
        functionName: 'balanceOf',
        args: [this.account.address],
      });

      position.underlyingBalance = balanceResult;
    }
  }

  async deposit(tokenInfo: TokenInfo) {
    const supplyCap = await this.publicClient.readContract({
      address: config.riskEngine,
      abi: RiskEngineAbi,
      functionName: 'supplyCap',
      args: [tokenInfo.pTokenAddress],
    });

    const position = this.positions[tokenInfo.address];

    const maxToSupply = min([
      supplyCap - (position?.deposited || 0n),
      position?.underlyingBalance || 0n,
    ]);

    if (maxToSupply <= 0n) {
      throw new Error('No available supply amount');
    }

    const depositAmount = getRandomAmount(1n, maxToSupply);

    // Approve first
    const approveHash = await this.sendTransaction({
      account: this.account,
      to: tokenInfo.address,
      value: 0n,
      chain: baseSepolia,
      data: encodeFunctionData({
        abi: MockTokenAbi,
        functionName: 'approve',
        args: [tokenInfo.pTokenAddress, depositAmount],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: approveHash });

    // Then deposit
    const depositHash = await this.sendTransaction({
      account: this.account,
      to: tokenInfo.pTokenAddress,
      value: 0n,
      chain: baseSepolia,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'deposit',
        args: [depositAmount, this.account.address],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: depositHash });

    if (!position?.inMarket) {
      const enterMarketTx = await this.sendTransaction({
        account: this.account,
        to: config.riskEngine,
        value: 0n,
        chain: baseSepolia,
        data: encodeFunctionData({
          abi: RiskEngineAbi,
          functionName: 'enterMarkets',
          args: [[tokenInfo.pTokenAddress]],
        }),
      });

      await this.publicClient.waitForTransactionReceipt({
        hash: enterMarketTx,
      });
    }

    if (position) {
      position.deposited += depositAmount;
      position.inMarket = true;
      position.underlyingBalance -= depositAmount;
    }
  }

  async borrow(tokenInfo: TokenInfo) {
    const availableBorrow = this.getAvailableAmount();
    if (availableBorrow <= 0n) {
      throw new Error('No available borrow amount');
    }

    const borrowAmount = getRandomAmount(
      1n,
      MathSol.divDownFixed(availableBorrow, tokenInfo.price)
    );

    const hash = await this.sendTransaction({
      account: this.account,
      to: tokenInfo.pTokenAddress,
      value: 0n,
      chain: baseSepolia,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'borrow',
        args: [borrowAmount],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash });

    const position = this.positions[tokenInfo.address];
    if (position) {
      position.borrowed += borrowAmount;
    }
  }

  async withdraw(tokenInfo: TokenInfo) {
    const totalBorrowedValue = this.calculateTotalBorrowedValue();
    const availableAmount = this.getAvailableAmount();

    const position = this.positions[tokenInfo.address];
    if (!position || position.deposited === 0n) {
      throw new Error('No deposits to withdraw');
    }

    const maxWithdraw = min([
      position.deposited,
      MathSol.divDownFixed(availableAmount, tokenInfo.price),
    ]);

    const withdrawAmount =
      totalBorrowedValue > 0n
        ? getRandomAmount(1n, maxWithdraw)
        : position.deposited;

    // Withdraw
    const withdrawHash = await this.sendTransaction({
      account: this.account,
      to: tokenInfo.pTokenAddress,
      value: 0n,
      chain: baseSepolia,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'withdraw',
        args: [withdrawAmount, this.account.address, this.account.address],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: withdrawHash });

    position.deposited -= withdrawAmount;
    position.underlyingBalance += withdrawAmount;

    // Exit market if fully withdrawn
    if (position.deposited === 0n && position.inMarket) {
      const exitHash = await this.sendTransaction({
        account: this.account,
        to: config.riskEngine,
        value: 0n,
        chain: baseSepolia,
        data: encodeFunctionData({
          abi: RiskEngineAbi,
          functionName: 'exitMarket',
          args: [tokenInfo.pTokenAddress],
        }),
      });
      await this.publicClient.waitForTransactionReceipt({ hash: exitHash });

      position.inMarket = false;
    }
  }

  async repay(tokenInfo: TokenInfo) {
    // Repay
    const position = this.positions[tokenInfo.address];

    if (!position || position.borrowed === 0n) {
      throw new Error('No borrowed amount to repay');
    }

    const maxRepay = min([position.borrowed, position.underlyingBalance]);
    const repayAmount = getRandomAmount(1n, maxRepay);

    const hash = await this.sendTransaction({
      account: this.account,
      to: tokenInfo.pTokenAddress,
      value: 0n,
      chain: baseSepolia,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'repayBorrow',
        args: [repayAmount],
      }),
    });

    await this.publicClient.waitForTransactionReceipt({ hash });

    position.borrowed -= repayAmount;
    position.underlyingBalance -= repayAmount;
  }

  async start() {
    console.log('Starting testnet position creation...');

    try {
      console.log('Sending initial ETH...');
      await this.sendInitialEth();

      console.log('Minting test tokens...');
      await this.mintAllTokens();

      const initialToken = getRandomToken();
      console.log(`Depositing initial token ${initialToken.address}...`);
      await this.deposit(initialToken);

      while (shouldContinue()) {
        const targetToken = getRandomToken();
        const action = getRandomAction(this.positions, targetToken.address);

        switch (action) {
          case 'deposit':
            console.log(`Depositing to: ${targetToken.pTokenAddress}`);
            await this.deposit(targetToken);
            break;
          case 'borrow':
            console.log(`Borrowing from: ${targetToken.pTokenAddress}`);
            await this.borrow(targetToken);
            break;
          case 'withdraw':
            console.log(`Withdrawing from: ${targetToken.pTokenAddress}`);
            await this.withdraw(targetToken);
            break;
          case 'repay':
            console.log(`Repaying to: ${targetToken.pTokenAddress}`);
            // Repay
            break;
        }
      }

      console.log('Position creation complete');
    } catch (error) {
      console.error('Transaction failed:', error);
      process.exit(1);
    }
  }
}

const createPositions = async () => {
  const creator = new PositionCreator();
  await creator.start();
};

const runMultiplePositionCreators = async (count: number) => {
  console.log(`Starting creation of ${count} positions...`);

  for (let i = 0; i < count; i++) {
    console.log(`\nStarting position creation ${i + 1} of ${count}`);
    console.log('----------------------------------------');

    try {
      await createPositions();
      console.log(`\nSuccessfully completed position creation ${i + 1}`);
    } catch (error) {
      console.error(`Failed on position creation ${i + 1}:`, error);
      // Continue with next iteration instead of exiting
      continue;
    }

    // Add a small delay between runs to avoid potential nonce issues
    if (i < count - 1) {
      console.log('\nWaiting 5 seconds before next position creation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\nCompleted all position creations!');
};

runMultiplePositionCreators(5).catch(error => {
  console.error('Failed to complete all position creations:', error);
  process.exit(1);
});
