import { createPublicClient, http, Address, PublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { validateEnvKeys } from './utils/validateEnvKeys';
import { RiskEngineAbi } from '../abis/RiskEngineAbi';
import { PTokenAbi } from '../abis/PTokenAbi';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys([
  'PSTETH_ADDRESS',
  'PUSDC_ADDRESS',
  'PWETH_ADDRESS',
  'RISK_ENGINE_ADDRESS',
]);

// Define the user address to monitor
const USER_ADDRESS = '0x...' as Address;

interface PTokenConfig {
  address: Address;
  name: string;
  decimals: number;
}

// Configuration
const config = {
  riskEngine: process.env.RISK_ENGINE_ADDRESS as Address,
  pTokens: {
    psteth: {
      address: process.env.PSTETH_ADDRESS as Address,
      name: 'pstETH',
      decimals: 18,
    },
    pusdc: {
      address: process.env.PUSDC_ADDRESS as Address,
      name: 'pUSDC',
      decimals: 6,
    },
    pweth: {
      address: process.env.PWETH_ADDRESS as Address,
      name: 'pWETH',
      decimals: 18,
    },
  } satisfies Record<string, PTokenConfig>,
};

class PTokenMetricsMonitor {
  private publicClient: PublicClient;

  constructor() {
    // @ts-ignore
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
  }

  private async getUserMetrics(pToken: PTokenConfig) {
    const [borrowBalance, tokenBalance, assetsIn] = await Promise.all([
      this.publicClient.readContract({
        address: pToken.address,
        abi: PTokenAbi,
        functionName: 'borrowBalanceStored',
        args: [USER_ADDRESS],
      }),
      this.publicClient.readContract({
        address: pToken.address,
        abi: PTokenAbi,
        functionName: 'balanceOf',
        args: [USER_ADDRESS],
      }),
      this.publicClient.readContract({
        address: config.riskEngine,
        abi: RiskEngineAbi,
        functionName: 'getAssetsIn',
        args: [USER_ADDRESS],
      }),
    ]);

    const isInMarkets = assetsIn.includes(pToken.address);

    return {
      borrowBalance,
      tokenBalance,
      isInMarkets,
    };
  }

  async monitorUserMetrics() {
    console.log(`Fetching metrics for user ${USER_ADDRESS}...\n`);

    for (const [key, pToken] of Object.entries(config.pTokens)) {
      console.log(`=== ${pToken.name} User Metrics ===`);
      try {
        const metrics = await this.getUserMetrics(pToken);
        console.log(
          `Borrow Balance: ${metrics.borrowBalance} (${metrics.borrowBalance.toString()} wei)`
        );
        console.log(
          `Token Balance: ${metrics.tokenBalance} (${metrics.tokenBalance.toString()} wei)`
        );
        console.log(
          `Listed in Markets: ${metrics.isInMarkets ? 'Yes' : 'No'}\n`
        );
      } catch (error) {
        console.error(`Error fetching metrics for ${pToken.name}:`, error);
      }
    }
  }
}

const monitor = async () => {
  const metricsMonitor = new PTokenMetricsMonitor();
  await metricsMonitor.monitorUserMetrics();
};

monitor().catch(error => {
  console.error('Failed to monitor user pToken metrics:', error);
  process.exit(1);
});
