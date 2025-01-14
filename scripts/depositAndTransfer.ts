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
import { PTokenAbi } from '../abis/PTokenAbi';
import { resolve } from 'path';
import { validateEnvKeys } from './validateEnvKeys';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys(['FUNDING_PRIVATE_KEY', 'USDC_ADDRESS', 'PUSDC_ADDRESS']);

// Configuration
const config = {
  fundingKey: process.env.FUNDING_PRIVATE_KEY!,
  usdcAddress: process.env.USDC_ADDRESS as Address,
  pUsdcAddress: process.env.PUSDC_ADDRESS as Address,
};

class PUSDCFundAndReturn {
  private publicClient: PublicClient;
  private walletClient: WalletClient;
  private account: Account;
  private fundingAccount: Account;

  constructor() {
    // Create random wallet to receive funds
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

    console.log(`Generated receiver wallet address: ${this.account.address}`);
    console.log(`Funding wallet address: ${this.fundingAccount.address}`);
  }

  async sendInitialFunding() {
    console.log('Sending initial ETH funding...');

    const fundingHash = await this.walletClient.sendTransaction({
      account: this.fundingAccount,
      to: this.account.address,
      value: parseEther('0.0001'),
      chain: baseSepolia,
    });

    await this.publicClient.waitForTransactionReceipt({ hash: fundingHash });
    console.log('Initial ETH funding sent successfully');
  }

  async mintDepositAndReturnHalf() {
    try {
      // Send initial ETH funding
      await this.sendInitialFunding();

      console.log('Minting USDC...');
      // Mint USDC
      const mintHash = await this.walletClient.sendTransaction({
        account: this.account,
        to: config.usdcAddress,
        value: 0n,
        chain: baseSepolia,
        data: encodeFunctionData({
          abi: MockTokenAbi,
          functionName: 'mint',
        }),
      });
      await this.publicClient.waitForTransactionReceipt({ hash: mintHash });

      // Get USDC balance
      const usdcBalance = await this.publicClient.readContract({
        address: config.usdcAddress,
        abi: MockTokenAbi,
        functionName: 'balanceOf',
        args: [this.account.address],
      });

      console.log(`Minted ${usdcBalance} USDC`);

      // Approve pUSDC contract to spend USDC
      console.log('Approving USDC spend...');
      const approveHash = await this.walletClient.sendTransaction({
        account: this.account,
        to: config.usdcAddress,
        value: 0n,
        chain: baseSepolia,
        data: encodeFunctionData({
          abi: MockTokenAbi,
          functionName: 'approve',
          args: [config.pUsdcAddress, usdcBalance],
        }),
      });
      await this.publicClient.waitForTransactionReceipt({ hash: approveHash });

      // Deposit USDC to get pUSDC
      console.log('Depositing USDC to get pUSDC...');
      const depositHash = await this.walletClient.sendTransaction({
        account: this.account,
        to: config.pUsdcAddress,
        value: 0n,
        chain: baseSepolia,
        data: encodeFunctionData({
          abi: PTokenAbi,
          functionName: 'deposit',
          args: [usdcBalance, this.account.address],
        }),
      });
      await this.publicClient.waitForTransactionReceipt({ hash: depositHash });

      // Get pUSDC balance
      const pUsdcBalance = await this.publicClient.readContract({
        address: config.pUsdcAddress,
        abi: PTokenAbi,
        functionName: 'balanceOf',
        args: [this.account.address],
      });

      // Calculate half of pUSDC to return
      const returnAmount = pUsdcBalance / 2n;

      if (returnAmount > 0n) {
        console.log(`Returning ${returnAmount} pUSDC to funder`);

        // Transfer half of pUSDC back to funder
        const transferHash = await this.walletClient.sendTransaction({
          account: this.account,
          to: config.pUsdcAddress,
          value: 0n,
          chain: baseSepolia,
          data: encodeFunctionData({
            abi: PTokenAbi,
            functionName: 'transfer',
            args: [this.fundingAccount.address, returnAmount],
          }),
        });
        await this.publicClient.waitForTransactionReceipt({
          hash: transferHash,
        });

        console.log(`Successfully returned ${returnAmount} pUSDC to funder`);
      }

      console.log('Process completed successfully');
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}

const fundAndReturn = async () => {
  const processor = new PUSDCFundAndReturn();
  await processor.mintDepositAndReturnHalf();
};

fundAndReturn().catch(error => {
  console.error('Failed to complete fund and return process:', error);
  process.exit(1);
});
