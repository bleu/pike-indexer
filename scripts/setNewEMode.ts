import { createWalletClient, http, Address, createPublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { validateEnvKeys } from './utils/validateEnvKeys';
import { RiskEngineAbi } from '../abis/RiskEngineAbi';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Validate required environment variables
validateEnvKeys([
  'ADMIN_PRIVATE_KEY',
  'RISK_ENGINE_ADDRESS',
  'PSTETH_ADDRESS',
  'PWETH_ADDRESS',
  'STETH_ADDRESS',
  'WETH_ADDRESS',
]);

// Configuration
const RISK_ENGINE_ADDRESS = process.env.RISK_ENGINE_ADDRESS as Address;
const EMODE_CATEGORY_ID = 1; // Using category ID 1 for ETH-correlated assets

// Configuration for tokens
const tokens = {
  steth: {
    address: process.env.STETH_ADDRESS as Address,
    pTokenAddress: process.env.PSTETH_ADDRESS as Address,
    name: 'stETH',
  },
  weth: {
    address: process.env.WETH_ADDRESS as Address,
    pTokenAddress: process.env.PWETH_ADDRESS as Address,
    name: 'WETH',
  },
};

async function configureEMode() {
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

  console.log('\nStarting EMode configuration...');

  try {
    const pTokenAddresses = Object.values(tokens).map(
      token => token.pTokenAddress
    );
    const collateralPermissions = pTokenAddresses.map(() => true); // Allow all tokens as collateral
    const borrowPermissions = pTokenAddresses.map(() => true); // Allow all tokens for borrowing

    console.log('\nAdding tokens to EMode category...');
    console.log('Tokens being added:', pTokenAddresses);

    const supportHash = await walletClient.writeContract({
      address: RISK_ENGINE_ADDRESS,
      abi: RiskEngineAbi,
      functionName: 'supportEMode',
      args: [
        EMODE_CATEGORY_ID,
        true, // isAllowed
        pTokenAddresses,
        collateralPermissions,
        borrowPermissions,
      ],
    });

    console.log(`Support EMode transaction sent: ${supportHash}`);
    await publicClient.waitForTransactionReceipt({ hash: supportHash });
    console.log('Tokens added to EMode successfully');
    console.log(`\nConfiguring EMode category ${EMODE_CATEGORY_ID}...`);

    // EMode configuration with higher factors for correlated assets
    const emodeConfig = {
      collateralFactorMantissa: 950000000000000000n, // 0.95
      liquidationThresholdMantissa: 975000000000000000n, // 0.975
      liquidationIncentiveMantissa: 1020000000000000000n, // 1.02
    };

    // Configure EMode category
    const configureHash = await walletClient.writeContract({
      address: RISK_ENGINE_ADDRESS,
      abi: RiskEngineAbi,
      functionName: 'configureEMode',
      args: [EMODE_CATEGORY_ID, emodeConfig],
    });

    console.log(`EMode configuration transaction sent: ${configureHash}`);
    await publicClient.waitForTransactionReceipt({ hash: configureHash });
    console.log('EMode category configured successfully');

    // Verify configuration for each token
    console.log('\nVerifying configurations...');

    for (const [tokenName, token] of Object.entries(tokens)) {
      // Verify collateral factor
      const collateralFactor = await publicClient.readContract({
        address: RISK_ENGINE_ADDRESS,
        abi: RiskEngineAbi,
        functionName: 'collateralFactor',
        args: [EMODE_CATEGORY_ID, token.pTokenAddress],
      });

      // Verify liquidation threshold
      const liquidationThreshold = await publicClient.readContract({
        address: RISK_ENGINE_ADDRESS,
        abi: RiskEngineAbi,
        functionName: 'liquidationThreshold',
        args: [EMODE_CATEGORY_ID, token.pTokenAddress],
      });

      console.log(`\nVerification for ${tokenName}:`);
      console.log(`Collateral Factor: ${collateralFactor}`);
      console.log(`Liquidation Threshold: ${liquidationThreshold}`);
    }

    console.log('\nEMode configuration completed successfully!');
  } catch (error) {
    console.error('Error configuring EMode:', error);
    throw error;
  }
}

// Execute the configuration
configureEMode().catch(error => {
  console.error('Failed to configure EMode:', error);
  process.exit(1);
});
