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
import { MockTokenAbi } from '../abis/MockTokenAbi';
import { RiskEngineAbi } from '@pike/utils/src/abis/RiskEngineAbi';
import { PTokenAbi } from '@pike/utils/src/abis/PTokenAbi';

export class BaseScenario {
  protected publicClient: PublicClient;
  protected walletClient: WalletClient;
  protected fundingAccount: Account;

  constructor(fundingKey: `0x${string}`) {
    // Create funding account from key
    this.fundingAccount = privateKeyToAccount(fundingKey);

    // Create clients
    // @ts-ignore
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    this.walletClient = createWalletClient({
      chain: baseSepolia,
      transport: http(),
    });
  }

  protected async getNonce(address: Address): Promise<number> {
    return await this.publicClient.getTransactionCount({
      address,
    });
  }

  protected async sendTransaction(params: any) {
    const nonce = await this.getNonce(params.account.address);
    return await this.walletClient.sendTransaction({
      ...params,
      nonce,
    });
  }

  protected async sendInitialEth(address: Address) {
    const hash = await this.walletClient.sendTransaction({
      account: this.fundingAccount,
      to: address,
      value: parseEther('0.001'),
      chain: baseSepolia,
    });

    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Sent initial ETH to ${address}`);
  }

  protected async mintToken(account: Account, tokenAddress: Address) {
    // Mint token
    const mintHash = await this.sendTransaction({
      account,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: MockTokenAbi,
        functionName: 'mint',
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: mintHash });

    // Get balance
    const balance = await this.publicClient.readContract({
      address: tokenAddress,
      abi: MockTokenAbi,
      functionName: 'balanceOf',
      args: [account.address],
    });

    console.log(`Minted token balance for ${account.address}: ${balance}`);
    return balance;
  }

  protected async deposit(
    account: Account,
    amount: bigint,
    tokenAddress: Address,
    pTokenAddress: Address
  ) {
    // Approve token transfer
    const approveHash = await this.sendTransaction({
      account,
      to: tokenAddress,
      data: encodeFunctionData({
        abi: MockTokenAbi,
        functionName: 'approve',
        args: [pTokenAddress, amount],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: approveHash });

    // Deposit token
    const depositHash = await this.sendTransaction({
      account,
      to: pTokenAddress,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'deposit',
        args: [amount, account.address],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash: depositHash });

    console.log(`Deposited ${amount} tokens for ${account.address}`);
  }

  protected async enterMarket(
    account: Account,
    pTokenAddress: Address,
    riskEngineAddress: Address
  ) {
    const hash = await this.sendTransaction({
      account,
      to: riskEngineAddress,
      data: encodeFunctionData({
        abi: RiskEngineAbi,
        functionName: 'enterMarkets',
        args: [[pTokenAddress]],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Entered market for ${account.address}`);
  }

  protected async borrow(
    account: Account,
    pTokenAddress: Address,
    amount: bigint
  ) {
    const hash = await this.sendTransaction({
      account,
      to: pTokenAddress,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'borrow',
        args: [amount],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Borrowed ${amount} tokens for ${account.address}`);
  }

  protected async repay(
    account: Account,
    pTokenAddress: Address,
    amount: bigint
  ) {
    const hash = await this.sendTransaction({
      account,
      to: pTokenAddress,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'repayBorrow',
        args: [amount],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Repaid ${amount} tokens for ${account.address}`);
  }

  protected async withdraw(
    account: Account,
    pTokenAddress: Address,
    amount: bigint
  ) {
    const hash = await this.sendTransaction({
      account,
      to: pTokenAddress,
      data: encodeFunctionData({
        abi: PTokenAbi,
        functionName: 'withdraw',
        args: [amount, account.address, account.address],
      }),
    });
    await this.publicClient.waitForTransactionReceipt({ hash });
    console.log(`Withdrew ${amount} tokens for ${account.address}`);
  }

  protected createRandomAccount(): Account {
    const privateKey = generatePrivateKey();
    return privateKeyToAccount(privateKey);
  }
}
