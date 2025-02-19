import {
  createPublicClient,
  createWalletClient,
  http,
  Address,
  parseEther,
  encodeFunctionData,
  parseUnits,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { baseSepolia } from 'viem/chains';
import { RiskEngineAbi } from '../abis/RiskEngineAbi';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { validateEnvKeys } from './utils/validateEnvKeys';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys([
  'ADMIN_PRIVATE_KEY',
  'RISK_ENGINE_ADDRESS',
  'PSTETH_ADDRESS',
  'PUSDC_ADDRESS',
  'PWETH_ADDRESS',
]);

// Configuration
const config = {
  adminKey: process.env.ADMIN_PRIVATE_KEY!,
  riskEngine: process.env.RISK_ENGINE_ADDRESS as Address,
  pTokens: {
    pSTETH: process.env.PSTETH_ADDRESS as Address,
    pUSDC: process.env.PUSDC_ADDRESS as Address,
    pWETH: process.env.PWETH_ADDRESS as Address,
  },
};

const setBorrowCaps = async (
  pTokenAddresses: Address[],
  newBorrowCaps: bigint[]
) => {
  // Validate input arrays
  if (pTokenAddresses.length !== newBorrowCaps.length) {
    throw new Error(
      'Arrays length mismatch: pTokens and borrow caps must match'
    );
  }

  // Create admin account
  const adminAccount = privateKeyToAccount(config.adminKey as `0x${string}`);

  // Initialize clients
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const walletClient = createWalletClient({
    chain: baseSepolia,
    transport: http(),
  });

  try {
    console.log('Setting new borrow caps...');

    // Encode and send transaction
    const hash = await walletClient.sendTransaction({
      account: adminAccount,
      to: config.riskEngine,
      data: encodeFunctionData({
        abi: RiskEngineAbi,
        functionName: 'setMarketBorrowCaps',
        args: [pTokenAddresses, newBorrowCaps],
      }),
    });

    // Wait for transaction confirmation
    await publicClient.waitForTransactionReceipt({ hash });

    console.log('Transaction successful!');
    console.log('Transaction hash:', hash);

    // Log new borrow caps for verification
    console.log('\nVerifying new borrow caps:');
    for (let i = 0; i < pTokenAddresses.length; i++) {
      const newCap = await publicClient.readContract({
        address: config.riskEngine,
        abi: RiskEngineAbi,
        functionName: 'borrowCap',
        args: [pTokenAddresses[i] as Address],
      });

      console.log(`${pTokenAddresses[i]}: ${newCap.toString()}`);
    }
  } catch (error) {
    console.error('Error setting borrow caps:', error);
    throw error;
  }
};

// Example usage
const updateBorrowCaps = async () => {
  // Example borrow caps (18 decimals for ETH/stETH, 6 for USDC)
  const newCaps = [
    parseEther('1000'), // 1000 stETH
    parseUnits('1000000', 6), // 1_00_000 USDC
    parseEther('1000'), // 1000 WETH
  ];

  const pTokenAddresses = [
    config.pTokens.pSTETH,
    config.pTokens.pUSDC,
    config.pTokens.pWETH,
  ];

  await setBorrowCaps(pTokenAddresses, newCaps);
};

// Run the script
updateBorrowCaps().catch(error => {
  console.error('Failed to update borrow caps:', error);
  process.exit(1);
});
