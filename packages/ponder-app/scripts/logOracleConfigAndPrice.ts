import { createPublicClient, http, Address, PublicClient } from 'viem';
import { baseSepolia } from 'viem/chains';
import dotenv from 'dotenv';
import { resolve } from 'path';
import { validateEnvKeys } from './utils/validateEnvKeys';
import { OracleEngineAbi } from '@pike/utils/src/abis/OracleEngineAbi';

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

validateEnvKeys([
  'STETH_ADDRESS',
  'USDC_ADDRESS',
  'WETH_ADDRESS',
  'RISK_ENGINE_ADDRESS',
  'ORACLE_ENGINE_ADDRESS',
]);

interface PTokenConfig {
  address: Address;
  name: string;
}

// Configuration
const config = {
  tokens: {
    steth: {
      address: process.env.STETH_ADDRESS as Address,
      name: 'stETH',
    },
    usdc: {
      address: process.env.USDC_ADDRESS as Address,
      name: 'USDC',
    },
    weth: {
      address: process.env.WETH_ADDRESS as Address,
      name: 'WETH',
    },
  } satisfies Record<string, PTokenConfig>,
  oracleEngine: process.env.ORACLE_ENGINE_ADDRESS as Address,
  riskEngine: process.env.RISK_ENGINE_ADDRESS as Address,
};

class OracleMetricsMonitor {
  private publicClient: PublicClient;

  constructor() {
    // @ts-ignore
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });
  }

  private async getOracleConfig(pToken: PTokenConfig) {
    const oracleConfig = await this.publicClient.readContract({
      address: config.oracleEngine,
      abi: OracleEngineAbi,
      functionName: 'configs',
      args: [pToken.address],
    });

    return oracleConfig;
  }

  private async getOraclePrice(pToken: PTokenConfig) {
    const price = await this.publicClient.readContract({
      address: config.oracleEngine,
      abi: OracleEngineAbi,
      functionName: 'getPrice',
      args: [pToken.address],
    });

    return price;
  }

  async monitorOracleMetrics() {
    console.log('Fetching Oracle metrics...\n');

    for (const [key, pToken] of Object.entries(config.tokens)) {
      console.log(`=== ${pToken.name} Oracle Metrics ===`);
      try {
        const [oracleConfig, price] = await Promise.all([
          this.getOracleConfig(pToken),
          this.getOraclePrice(pToken),
        ]);

        console.log('Oracle Configuration:');
        console.log(`Main Oracle: ${oracleConfig.mainOracle}`);
        console.log(`Fallback Oracle: ${oracleConfig.fallbackOracle}`);
        console.log(
          `Lower Bound Ratio: ${oracleConfig.lowerBoundRatio.toString()}`
        );
        console.log(
          `Upper Bound Ratio: ${oracleConfig.upperBoundRatio.toString()}`
        );
        console.log(`Current Price: $${price}\n`);
      } catch (error) {
        console.error(
          `Error fetching oracle metrics for ${pToken.name}:`,
          error
        );
      }
    }
  }
}

const monitor = async () => {
  const oracleMonitor = new OracleMetricsMonitor();
  await oracleMonitor.monitorOracleMetrics();
};

monitor().catch(error => {
  console.error('Failed to monitor oracle metrics:', error);
  process.exit(1);
});
