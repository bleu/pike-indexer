import { createPublicClient, http, Address, PublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';
import { PTokenAbi } from '../abis/PTokenAbi';
import { resolve } from 'path';
import { validateEnvKeys } from './validateEnvKeys';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys(['PSTETH_ADDRESS', 'PUSDC_ADDRESS', 'PWETH_ADDRESS']);

interface PTokenConfig {
  address: Address;
  name: string;
  decimals: number;
}

// Configuration
const config = {
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

  private async getPTokenMetrics(pToken: PTokenConfig) {
    const [totalSupply, totalBorrows, cash, totalReserves] = await Promise.all([
      this.publicClient.readContract({
        address: pToken.address,
        abi: PTokenAbi,
        functionName: 'totalSupply',
      }),
      this.publicClient.readContract({
        address: pToken.address,
        abi: PTokenAbi,
        functionName: 'totalBorrows',
      }),
      this.publicClient.readContract({
        address: pToken.address,
        abi: PTokenAbi,
        functionName: 'getCash',
      }),
      this.publicClient.readContract({
        address: pToken.address,
        abi: PTokenAbi,
        functionName: 'totalReserves',
      }),
    ]);

    return {
      totalSupply,
      totalBorrows,
      cash,
      totalReserves,
    };
  }

  async monitorAllPTokens() {
    console.log('Fetching pToken metrics...\n');

    for (const [key, pToken] of Object.entries(config.pTokens)) {
      console.log(`=== ${pToken.name} Metrics ===`);
      try {
        const metrics = await this.getPTokenMetrics(pToken);
        console.log(
          `Total Supply: ${metrics.totalSupply} (${metrics.totalSupply.toString()} wei)`
        );
        console.log(
          `Total Borrows: ${metrics.totalBorrows} (${metrics.totalBorrows.toString()} wei)`
        );
        console.log(`Cash: ${metrics.cash} (${metrics.cash.toString()} wei)`);
        console.log(
          `Total Reserves: ${metrics.totalReserves} (${metrics.totalReserves.toString()} wei)\n`
        );
      } catch (error) {
        console.error(`Error fetching metrics for ${pToken.name}:`, error);
      }
    }
  }
}

const monitor = async () => {
  const metricsMonitor = new PTokenMetricsMonitor();
  await metricsMonitor.monitorAllPTokens();
};

monitor().catch(error => {
  console.error('Failed to monitor pToken metrics:', error);
  process.exit(1);
});
