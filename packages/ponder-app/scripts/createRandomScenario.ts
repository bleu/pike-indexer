import { Address, parseEther } from 'viem';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { BaseScenario } from './utils/baseScenario';
import { validateEnvKeys } from './utils/validateEnvKeys';
import {
  TokenConfig,
  TokenInfo,
  TokenPositions,
  UserPosition,
  Action,
} from './utils/types';
import { MathSol, min } from '../src/utils/math';
import { RiskEngineAbi } from '@pike/utils/src/abis/RiskEngineAbi';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys([
  'FUNDING_PRIVATE_KEY',
  'RISK_ENGINE_ADDRESS',
  'STETH_ADDRESS',
  'PSTETH_ADDRESS',
  'STETH_PRICE',
  'USDC_ADDRESS',
  'PUSDC_ADDRESS',
  'USDC_PRICE',
  'WETH_ADDRESS',
  'PWETH_ADDRESS',
  'WETH_PRICE',
]);

// Configuration
const config = {
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
  const range = max - min + 1n;
  const randomBigInt = BigInt(Math.floor(Math.random() * Number(range)));
  return min + randomBigInt;
};

const shouldContinue = (): boolean => {
  return Math.random() > 0.2;
};

const getRandomToken = (): TokenInfo => {
  const tokens = Object.values(config.tokens);
  return tokens[Math.floor(Math.random() * tokens.length)] as TokenInfo;
};

class RandomPositionCreator extends BaseScenario {
  private randomAccount;
  private positions: TokenPositions;

  constructor() {
    super(process.env.FUNDING_PRIVATE_KEY as `0x${string}`);

    // Create random wallet
    this.randomAccount = this.createRandomAccount();

    // Initialize positions
    this.positions = Object.values(config.tokens).reduce<TokenPositions>(
      (acc, token) => ({
        ...acc,
        [token.address]: {
          deposited: 0n,
          borrowed: 0n,
          inMarket: false,
          underlyingBalance: 0n,
        },
      }),
      {} as TokenPositions
    );

    console.log(
      `Generated random wallet address: ${this.randomAccount.address}`
    );
  }

  private getPossibleActions(token: Address): Action[] {
    const position = this.positions[token] as UserPosition;
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

    const allPositions = Object.values(this.positions);
    if (
      allPositions.some(
        position => position.inMarket && position.deposited > 0n
      )
    ) {
      possibleActions.push('borrow');
    }

    return possibleActions;
  }

  private getRandomAction(token: Address): Action {
    const possibleActions = this.getPossibleActions(token);
    return possibleActions[
      Math.floor(Math.random() * possibleActions.length)
    ] as Action;
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
      MathSol.divDownFixed(totalCollateralValue, parseEther('2')) -
      totalBorrowedValue
    );
  }

  async mintAllTokens() {
    for (const tokenInfo of Object.values(config.tokens)) {
      const balance = await this.mintToken(
        this.randomAccount,
        tokenInfo.address
      );

      const position = this.positions[tokenInfo.address] as UserPosition;
      position.underlyingBalance = balance;
    }
  }

  private async handleDeposit(tokenInfo: TokenInfo) {
    const supplyCap = await this.publicClient.readContract({
      address: process.env.RISK_ENGINE_ADDRESS as Address,
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
    await this.deposit(
      this.randomAccount,
      depositAmount,
      tokenInfo.address,
      tokenInfo.pTokenAddress
    );

    if (!position?.inMarket) {
      await this.enterMarket(
        this.randomAccount,
        tokenInfo.pTokenAddress,
        process.env.RISK_ENGINE_ADDRESS as Address
      );
    }

    if (position) {
      position.deposited += depositAmount;
      position.inMarket = true;
      position.underlyingBalance -= depositAmount;
    }
  }

  private async handleBorrow(tokenInfo: TokenInfo) {
    const availableBorrow = this.getAvailableAmount();
    if (availableBorrow <= 0n) {
      throw new Error('No available borrow amount');
    }

    const borrowAmount = getRandomAmount(
      1n,
      MathSol.divDownFixed(availableBorrow, tokenInfo.price)
    );

    await this.borrow(
      this.randomAccount,
      tokenInfo.pTokenAddress,
      borrowAmount
    );

    const position = this.positions[tokenInfo.address];
    if (position) {
      position.borrowed += borrowAmount;
    }
  }

  private async handleWithdraw(tokenInfo: TokenInfo) {
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

    await this.withdraw(
      this.randomAccount,
      tokenInfo.pTokenAddress,
      withdrawAmount
    );

    position.deposited -= withdrawAmount;
    position.underlyingBalance += withdrawAmount;
  }

  private async handleRepay(tokenInfo: TokenInfo) {
    const position = this.positions[tokenInfo.address];
    if (!position || position.borrowed === 0n) {
      throw new Error('No borrowed amount to repay');
    }

    const maxRepay = min([position.borrowed, position.underlyingBalance]);
    const repayAmount = getRandomAmount(1n, maxRepay);

    await this.repay(this.randomAccount, tokenInfo.pTokenAddress, repayAmount);

    position.borrowed -= repayAmount;
    position.underlyingBalance -= repayAmount;
  }

  async start() {
    console.log('Starting random position creation...');

    try {
      console.log('Sending initial ETH...');
      await this.sendInitialEth(this.randomAccount.address);

      console.log('Minting test tokens...');
      await this.mintAllTokens();

      const initialToken = getRandomToken();
      console.log(`Depositing initial token ${initialToken.address}...`);
      await this.handleDeposit(initialToken);

      while (shouldContinue()) {
        const targetToken = getRandomToken();
        const action = this.getRandomAction(targetToken.address);

        switch (action) {
          case 'deposit':
            console.log(`Depositing to: ${targetToken.pTokenAddress}`);
            await this.handleDeposit(targetToken);
            break;
          case 'borrow':
            console.log(`Borrowing from: ${targetToken.pTokenAddress}`);
            await this.handleBorrow(targetToken);
            break;
          case 'withdraw':
            console.log(`Withdrawing from: ${targetToken.pTokenAddress}`);
            await this.handleWithdraw(targetToken);
            break;
          case 'repay':
            console.log(`Repaying to: ${targetToken.pTokenAddress}`);
            await this.handleRepay(targetToken);
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

// Create multiple positions
const runMultiplePositionCreators = async (count: number) => {
  console.log(`Starting creation of ${count} positions...`);

  for (let i = 0; i < count; i++) {
    console.log(`\nStarting position creation ${i + 1} of ${count}`);
    console.log('----------------------------------------');

    try {
      const creator = new RandomPositionCreator();
      await creator.start();
      console.log(`\nSuccessfully completed position creation ${i + 1}`);
    } catch (error) {
      console.error(`Failed on position creation ${i + 1}:`, error);
      continue;
    }

    if (i < count - 1) {
      console.log('\nWaiting 5 seconds before next position creation...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  console.log('\nCompleted all position creations!');
};

// Execute the script
runMultiplePositionCreators(5).catch(error => {
  console.error('Failed to complete all position creations:', error);
  process.exit(1);
});
