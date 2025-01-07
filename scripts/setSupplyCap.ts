import {
  createPublicClient,
  createWalletClient,
  http,
  Address,
  parseEther,
  encodeFunctionData,
  parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { RiskEngineAbi } from "../abis/RiskEngineAbi";
import dotenv from "dotenv";
import { resolve } from "path";

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

// Validate required environment variables
const requiredEnvVars = [
  "ADMIN_PRIVATE_KEY",
  "RISK_ENGINE_ADDRESS",
  "PSTETH_ADDRESS",
  "PUSDC_ADDRESS",
  "PWETH_ADDRESS",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

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

const setSupplyCaps = async (
  pTokenAddresses: Address[],
  newSupplyCaps: bigint[]
) => {
  // Validate input arrays
  if (pTokenAddresses.length !== newSupplyCaps.length) {
    throw new Error(
      "Arrays length mismatch: pTokens and supply caps must match"
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
    console.log("Setting new supply caps...");

    // Encode and send transaction
    const hash = await walletClient.sendTransaction({
      account: adminAccount,
      to: config.riskEngine,
      data: encodeFunctionData({
        abi: RiskEngineAbi,
        functionName: "setMarketSupplyCaps",
        args: [pTokenAddresses, newSupplyCaps],
      }),
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log("Transaction successful!");
    console.log("Transaction hash:", hash);

    // Log new supply caps for verification
    console.log("\nVerifying new supply caps:");
    for (let i = 0; i < pTokenAddresses.length; i++) {
      const newCap = await publicClient.readContract({
        address: config.riskEngine,
        abi: RiskEngineAbi,
        functionName: "supplyCap",
        args: [pTokenAddresses[i] as Address],
      });

      console.log(`${pTokenAddresses[i]}: ${newCap.toString()}`);
    }
  } catch (error) {
    console.error("Error setting supply caps:", error);
    throw error;
  }
};

// Example usage
const updateSupplyCaps = async () => {
  // Example supply caps (18 decimals for ETH/stETH, 6 for USDC)
  const newCaps = [
    parseEther("1000"), // 1000 stETH
    parseUnits("1000000", 6), // 1_00_000 USDC
    parseEther("1000"), // 1000 WETH
  ];

  const pTokenAddresses = [
    config.pTokens.pSTETH,
    config.pTokens.pUSDC,
    config.pTokens.pWETH,
  ];

  await setSupplyCaps(pTokenAddresses, newCaps);
};

// Run the script
updateSupplyCaps().catch((error) => {
  console.error("Failed to update supply caps:", error);
  process.exit(1);
});
