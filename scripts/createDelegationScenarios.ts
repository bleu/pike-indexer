import { Address, encodeFunctionData } from 'viem';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { BaseScenario } from './utils/baseScenario';
import { validateEnvKeys } from './utils/validateEnvKeys';
import { RiskEngineAbi } from '../abis/RiskEngineAbi';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys(['FUNDING_PRIVATE_KEY', 'RISK_ENGINE_ADDRESS']);

class DelegationScenario extends BaseScenario {
  private funderAccount;
  private testAccount1;
  private testAccount2;

  constructor() {
    super(process.env.FUNDING_PRIVATE_KEY as `0x${string}`);

    // Create random wallets
    this.funderAccount = this.fundingAccount;
    this.testAccount1 = this.createRandomAccount();
    this.testAccount2 = this.createRandomAccount();

    console.log('Funder address:', this.funderAccount.address);
    console.log('Test Account 1:', this.testAccount1.address);
    console.log('Test Account 2:', this.testAccount2.address);
  }

  private async updateDelegate(
    account: any,
    delegate: Address,
    approved: boolean
  ) {
    const hash = await this.sendTransaction({
      account: account,
      to: process.env.RISK_ENGINE_ADDRESS as Address,
      data: encodeFunctionData({
        abi: RiskEngineAbi,
        functionName: 'updateDelegate',
        args: [delegate, approved],
      }),
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(
      `Updated delegate for ${account.address}: delegate=${delegate}, approved=${approved}`
    );
  }

  async start() {
    console.log('Starting delegation scenarios...');

    try {
      // Send initial ETH to test accounts
      console.log('\nSending initial ETH to test accounts...');
      await this.sendInitialEth(this.testAccount1.address);
      await this.sendInitialEth(this.testAccount2.address);

      // Scenario 1: Set delegate
      console.log('\nScenario 1: Setting delegate for test account 1...');
      await this.updateDelegate(
        this.testAccount1,
        this.funderAccount.address,
        true
      );

      // Scenario 2: Set and unset delegate
      console.log(
        '\nScenario 2: Setting and unsetting delegate for test account 2...'
      );
      await this.updateDelegate(
        this.testAccount2,
        this.funderAccount.address,
        true
      );

      // Wait a bit before unsetting
      await new Promise(resolve => setTimeout(resolve, 2000));

      await this.updateDelegate(
        this.testAccount2,
        this.funderAccount.address,
        false
      );
    } catch (error) {
      console.error('Error in delegation scenarios:', error);
      process.exit(1);
    }
  }
}

// Execute the scenarios
const scenario = new DelegationScenario();
scenario.start().catch(error => {
  console.error('Failed to execute delegation scenarios:', error);
  process.exit(1);
});
