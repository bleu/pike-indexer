import { createWalletClient, http, Address, createPublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { OracleEngineAbi } from '../abis/OracleEngineAbi';
import { MockOracleAbi } from './abis/MockOracleAbi';
import { validateEnvKeys } from './utils/validateEnvKeys';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Validate required environment variables
validateEnvKeys([
  'ADMIN_PRIVATE_KEY',
  'PSTETH_ADDRESS',
  'PUSDC_ADDRESS',
  'PWETH_ADDRESS',
  'STETH_ADDRESS',
  'USDC_ADDRESS',
  'WETH_ADDRESS',
  'STETH_PRICE',
  'USDC_PRICE',
  'WETH_PRICE',
  'ORACLE_ENGINE_ADDRESS',
]);

const ORACLE_ENGINE_ADDRESS = process.env.ORACLE_ENGINE_ADDRESS as Address;
const MOCK_ORACLE_ADDRESS = '0xc34df3ce38773ae01a61a6cfc93a76060fbb5d84';
const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

// Configuration for tokens
const tokens = {
  steth: {
    address: process.env.STETH_ADDRESS as Address,
    pTokenAddress: process.env.PSTETH_ADDRESS as Address,
    name: 'stETH',
    price: BigInt(3285000000),
    decimals: 18n,
  },
  usdc: {
    address: process.env.USDC_ADDRESS as Address,
    pTokenAddress: process.env.PUSDC_ADDRESS as Address,
    name: 'USDC',
    price: BigInt(1000000),
    decimals: 6n,
  },
  weth: {
    address: process.env.WETH_ADDRESS as Address,
    pTokenAddress: process.env.PWETH_ADDRESS as Address,
    name: 'WETH',
    price: BigInt(1005000000),
    decimals: 18n,
  },
};

async function configureOraclesAndPrices() {
  // Create account from private key
  const account = privateKeyToAccount(
    process.env.ADMIN_PRIVATE_KEY as `0x${string}`
  );

  // Create wallet client
  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  // Create public client for reading state
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  // First set prices in mock oracle
  console.log('\nSetting prices in mock oracle...');
  for (const [tokenName, token] of Object.entries(tokens)) {
    try {
      console.log(`\nSetting price for ${tokenName}...`);

      // Get current price
      const currentPrice = await publicClient.readContract({
        address: MOCK_ORACLE_ADDRESS,
        abi: MockOracleAbi,
        functionName: 'getPrice',
        args: [token.address],
      });

      console.log(`Current price for ${tokenName}: ${currentPrice}`);

      // Set new price
      const hash = await walletClient.writeContract({
        address: MOCK_ORACLE_ADDRESS,
        abi: MockOracleAbi,
        functionName: 'setPrice',
        args: [token.address, token.price, token.decimals],
      });

      console.log(`Transaction sent: ${hash}`);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      // Verify the new price
      const newPrice = await publicClient.readContract({
        address: MOCK_ORACLE_ADDRESS,
        abi: MockOracleAbi,
        functionName: 'getPrice',
        args: [token.address],
      });

      console.log(`New price for ${tokenName}: ${newPrice}`);
    } catch (error) {
      console.error(`Error setting price for ${tokenName}:`, error);
    }
  }

  // Then configure oracle engine for each pToken
  console.log('\nConfiguring oracle engine...');
  for (const [tokenName, token] of Object.entries(tokens)) {
    try {
      console.log(`\nConfiguring oracle for p${tokenName}...`);

      // Get current configuration
      const currentConfig = await publicClient.readContract({
        address: ORACLE_ENGINE_ADDRESS,
        abi: OracleEngineAbi,
        functionName: 'configs',
        args: [token.pTokenAddress],
      });

      console.log('Current configuration:');
      console.log(`Main Oracle: ${currentConfig.mainOracle}`);
      console.log(`Fallback Oracle: ${currentConfig.fallbackOracle}`);
      console.log(`Lower Bound Ratio: ${currentConfig.lowerBoundRatio}`);
      console.log(`Upper Bound Ratio: ${currentConfig.upperBoundRatio}`);

      // Set new configuration
      // Using 0.95 (95%) as lower bound and 1.05 (105%) as upper bound
      const lowerBoundRatio = 950000000000000000n; // 0.95 with 18 decimals
      const upperBoundRatio = 1050000000000000000n; // 1.05 with 18 decimals

      const hash = await walletClient.writeContract({
        address: ORACLE_ENGINE_ADDRESS,
        abi: OracleEngineAbi,
        functionName: 'setAssetConfig',
        args: [
          token.pTokenAddress,
          MOCK_ORACLE_ADDRESS,
          ZERO_ADDRESS, // No fallback oracle
          lowerBoundRatio,
          upperBoundRatio,
        ],
      });

      console.log(`Transaction sent: ${hash}`);

      // Wait for transaction to be mined
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log('Transaction confirmed in block:', receipt.blockNumber);

      // Verify the update
      const newConfig = await publicClient.readContract({
        address: ORACLE_ENGINE_ADDRESS,
        abi: OracleEngineAbi,
        functionName: 'configs',
        args: [token.pTokenAddress],
      });

      console.log('\nUpdated configuration:');
      console.log(`Main Oracle: ${newConfig.mainOracle}`);
      console.log(`Fallback Oracle: ${newConfig.fallbackOracle}`);
      console.log(`Lower Bound Ratio: ${newConfig.lowerBoundRatio}`);
      console.log(`Upper Bound Ratio: ${newConfig.upperBoundRatio}`);

      if (
        newConfig.mainOracle.toLowerCase() === MOCK_ORACLE_ADDRESS.toLowerCase()
      ) {
        console.log(
          `✓ p${tokenName} oracle configuration updated successfully!`
        );
      } else {
        console.log(
          `⚠ Warning: p${tokenName} oracle configuration verification failed`
        );
      }
    } catch (error) {
      console.error(`Error configuring oracle for p${tokenName}:`, error);
    }
  }
}

// Execute the configuration
configureOraclesAndPrices().catch(error => {
  console.error('Failed to configure oracles and prices:', error);
  process.exit(1);
});
