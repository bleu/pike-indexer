import {
  createPublicClient,
  createWalletClient,
  http,
  Address,
  encodeFunctionData,
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
  "PUSDC_ADDRESS",
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
  pUSDC: process.env.PUSDC_ADDRESS as Address,
};

const setUSDCMintPauseState = async (pauseState: boolean) => {
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
    console.log(`${pauseState ? "Pausing" : "Resuming"} minting for USDC...`);

    // Encode and send transaction
    const hash = await walletClient.sendTransaction({
      account: adminAccount,
      to: config.riskEngine,
      data: encodeFunctionData({
        abi: RiskEngineAbi,
        functionName: "setMintPaused",
        args: [config.pUSDC, pauseState],
      }),
    });

    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    console.log("Transaction successful!");
    console.log("Transaction hash:", hash);
  } catch (error) {
    console.error(
      `Error ${pauseState ? "pausing" : "resuming"} USDC minting:`,
      error
    );
    throw error;
  }
};

// Example usage - pause USDC minting, wait 1 minute, then resume
const pauseAndResumeUSDCMinting = async () => {
  try {
    // Pause USDC minting
    console.log("Pausing USDC minting...");
    await setUSDCMintPauseState(true);

    console.log("\nWaiting 1 minute before resuming...");
    await new Promise((resolve) => setTimeout(resolve, 60000));

    // Resume USDC minting
    console.log("Resuming USDC minting...");
    await setUSDCMintPauseState(false);

    console.log("\nCompleted USDC pause and resume cycle!");
  } catch (error) {
    console.error("Error in USDC pause/resume cycle:", error);
    throw error;
  }
};

// Run the script
pauseAndResumeUSDCMinting().catch((error) => {
  console.error("Failed to complete USDC pause/resume cycle:", error);
  process.exit(1);
});
