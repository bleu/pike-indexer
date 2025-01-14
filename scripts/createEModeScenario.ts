import { parseEther, Address, encodeFunctionData } from 'viem';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { BaseScenario } from './utils/baseScenario';
import { validateEnvKeys } from './utils/validateEnvKeys';
import { RiskEngineAbi } from '../abis/RiskEngineAbi';

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

const EMODE_CATEGORY_ID = 1; // Same category ID as configured in previous script

class EModePositionScenario extends BaseScenario {
  private userAccount;

  constructor() {
    super(process.env.FUNDING_PRIVATE_KEY as `0x${string}`);

    // Create random wallet for the user
    this.userAccount = this.createRandomAccount();
    console.log('User address:', this.userAccount.address);
  }

  private async switchToEMode() {
    const hash = await this.sendTransaction({
      account: this.userAccount,
      to: process.env.RISK_ENGINE_ADDRESS as Address,
      data: encodeFunctionData({
        abi: RiskEngineAbi,
        functionName: 'switchEMode',
        args: [EMODE_CATEGORY_ID],
      }),
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Switched to EMode category ${EMODE_CATEGORY_ID}`);
  }

  private async verifyEModeCategory() {
    const category = await this.publicClient.readContract({
      address: process.env.RISK_ENGINE_ADDRESS as Address,
      abi: RiskEngineAbi,
      functionName: 'accountCategory',
      args: [this.userAccount.address],
    });

    console.log(`Current EMode category: ${category}`);
    return category;
  }

  async start() {
    console.log('Starting EMode position setup...');

    try {
      // Send initial ETH to user account
      console.log('\nSending initial ETH to user account...');
      await this.sendInitialEth(this.userAccount.address);

      // Mint WETH for the user
      console.log('\nMinting WETH for user...');
      const depositAmount = parseEther('0.5');
      await this.mintToken(
        this.userAccount,
        process.env.WETH_ADDRESS as Address
      );

      // Deposit WETH and enter market
      console.log('\nDepositing WETH and entering market...');
      await this.deposit(
        this.userAccount,
        depositAmount,
        process.env.WETH_ADDRESS as Address,
        process.env.PWETH_ADDRESS as Address
      );

      // Enter market
      const enterMarketHash = await this.sendTransaction({
        account: this.userAccount,
        to: process.env.RISK_ENGINE_ADDRESS as Address,
        data: encodeFunctionData({
          abi: RiskEngineAbi,
          functionName: 'enterMarkets',
          args: [[process.env.PWETH_ADDRESS as Address]],
        }),
      });

      await this.publicClient.waitForTransactionReceipt({
        hash: enterMarketHash,
      });
      console.log('Entered WETH market');

      // Verify initial EMode category
      console.log('\nChecking initial EMode category...');
      const initialCategory = await this.verifyEModeCategory();
      console.log(`Initial category: ${initialCategory}`);

      // Switch to ETH correlated EMode
      console.log('\nSwitching to ETH correlated EMode...');
      await this.switchToEMode();

      // Verify new EMode category
      console.log('\nVerifying new EMode category...');
      const newCategory = await this.verifyEModeCategory();

      if (newCategory === EMODE_CATEGORY_ID) {
        console.log('Successfully switched to ETH correlated EMode!');
      } else {
        console.log('Warning: EMode category verification failed');
      }

      // Get account liquidity information
      console.log('\nChecking account liquidity...');
      const [error, liquidity, shortfall] =
        await this.publicClient.readContract({
          address: process.env.RISK_ENGINE_ADDRESS as Address,
          abi: RiskEngineAbi,
          functionName: 'getAccountLiquidity',
          args: [this.userAccount.address],
        });

      console.log('Account liquidity status:');
      console.log('Error:', error);
      console.log('Liquidity:', liquidity);
      console.log('Shortfall:', shortfall);

      console.log('\nEMode position setup completed successfully!');
    } catch (error) {
      console.error('Error in EMode position setup:', error);
      process.exit(1);
    }
  }
}

// Execute the scenario
const scenario = new EModePositionScenario();
scenario.start().catch(error => {
  console.error('Failed to execute EMode position setup:', error);
  process.exit(1);
});
