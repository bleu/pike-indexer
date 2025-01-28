// NOTE: This script will only work if the stETH price is near WETH price normal
//  and WETH oracle config is pointing to the mock oracle

import { parseEther, Address, encodeFunctionData } from 'viem';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { MockOracleAbi } from './abis/MockOracleAbi';
import { BaseScenario } from './utils/baseScenario';
import { validateEnvKeys } from './utils/validateEnvKeys';
import { PTokenAbi } from '@pike/utils/src/abis/PTokenAbi';
import { MockTokenAbi } from './abis/MockTokenAbi';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys([
  'FUNDING_PRIVATE_KEY',
  'RISK_ENGINE_ADDRESS',
  'STETH_ADDRESS',
  'PSTETH_ADDRESS',
  'WETH_ADDRESS',
  'PWETH_ADDRESS',
]);

const MOCK_ORACLE = '0xc34df3ce38773ae01a61a6cfc93a76060fbb5d84';
const WETH_PRICE_NORMAL = BigInt('3285000000'); // $3285 with 6 decimals
const WETH_PRICE_LOW = BigInt('1001000000'); // $1001 with 6 decimals
const DECIMALS_18 = 18n;

class LiquidationScenario extends BaseScenario {
  private liquidatorAccount;
  private borrowerAccount;

  constructor() {
    super(process.env.FUNDING_PRIVATE_KEY as `0x${string}`);

    // Create random wallets
    this.liquidatorAccount = this.createRandomAccount();
    this.borrowerAccount = this.createRandomAccount();

    console.log('Liquidator address:', this.liquidatorAccount.address);
    console.log('Borrower address:', this.borrowerAccount.address);
  }

  private async setWethPrice(price: bigint) {
    const hash = await this.sendTransaction({
      account: this.fundingAccount,
      to: MOCK_ORACLE,
      data: encodeFunctionData({
        abi: MockOracleAbi,
        functionName: 'setPrice',
        args: [process.env.WETH_ADDRESS as Address, price, DECIMALS_18],
      }),
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Set WETH price to: ${price}`);
  }

  private async liquidate(repayAmount: bigint) {
    // Approve stETH transfer for liquidation
    const approveHash = await this.sendTransaction({
      account: this.liquidatorAccount,
      to: process.env.STETH_ADDRESS as Address,
      data: encodeFunctionData({
        abi: MockTokenAbi,
        functionName: 'approve',
        args: [process.env.PSTETH_ADDRESS as Address, repayAmount],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: approveHash });

    // Liquidate
    const liquidateHash = await this.sendTransaction({
      account: this.liquidatorAccount,
      to: process.env.PSTETH_ADDRESS as Address,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'liquidateBorrow',
        args: [
          this.borrowerAccount.address,
          repayAmount,
          process.env.PWETH_ADDRESS as Address,
        ],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: liquidateHash });
    console.log(`Liquidated borrower with ${repayAmount} stETH`);
  }

  async start() {
    console.log('Starting liquidation scenario...');

    try {
      // Send initial ETH to both accounts
      console.log('\nSending initial ETH...');
      await this.sendInitialEth(this.liquidatorAccount.address);
      await this.sendInitialEth(this.borrowerAccount.address);

      // Mint WETH for borrower
      console.log('\nMinting WETH for borrower...');
      await this.mintToken(
        this.borrowerAccount,
        process.env.WETH_ADDRESS as Address
      );

      // Deposit 0.1 WETH and enter market
      console.log('\nDepositing WETH and entering market...');
      const depositAmount = parseEther('0.1');
      await this.deposit(
        this.borrowerAccount,
        depositAmount,
        process.env.WETH_ADDRESS as Address,
        process.env.PWETH_ADDRESS as Address
      );
      await this.enterMarket(
        this.borrowerAccount,
        process.env.PWETH_ADDRESS as Address,
        process.env.RISK_ENGINE_ADDRESS as Address
      );

      // Borrow 0.05 stETH
      console.log('\nBorrowing stETH...');
      const borrowAmount = parseEther('0.05');
      await this.borrow(
        this.borrowerAccount,
        process.env.PSTETH_ADDRESS as Address,
        borrowAmount
      );

      // Set WETH price low to trigger liquidation
      console.log('\nSetting WETH price low...');
      await this.setWethPrice(WETH_PRICE_LOW);

      // Mint stETH for liquidator
      console.log('\nMinting stETH for liquidator...');
      await this.mintToken(
        this.liquidatorAccount,
        process.env.STETH_ADDRESS as Address
      );

      // Liquidate 0.005 stETH
      console.log('\nPerforming liquidation...');
      const liquidateAmount = parseEther('0.005');
      await this.liquidate(liquidateAmount);

      // Set WETH price back to normal
      console.log('\nSetting WETH price back to normal...');
      await this.setWethPrice(WETH_PRICE_NORMAL);

      console.log('\nLiquidation scenario completed successfully!');
    } catch (error) {
      console.error('Error in liquidation scenario:', error);
      process.exit(1);
    }
  }
}

// Execute the scenario
const scenario = new LiquidationScenario();
scenario.start().catch(error => {
  console.error('Failed to execute liquidation scenario:', error);
  process.exit(1);
});
