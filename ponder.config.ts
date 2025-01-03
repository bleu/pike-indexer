import { createConfig, mergeAbis } from "ponder";
import { http } from "viem";

import { ProxyAbi } from "./abis/ProxyAbi";
import { baseSepolia } from "viem/chains";
import { FactoryAbi } from "./abis/FactoryAbi";
import { RiskEngineRouterAbi } from "./abis/RiskEngineRouterAbi";

export default createConfig({
  networks: {
    baseSepolia: {
      chainId: baseSepolia.id,
      transport: http(process.env.BASE_SEPOLIA_URL),
    },
  },
  contracts: {
    Factory: {
      network: "baseSepolia",
      abi: mergeAbis([FactoryAbi, ProxyAbi]),
      address: "0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D",
      startBlock: 19991778,
    },
    RiskEngineRouter: {
      network: "baseSepolia",
      address: "0x0cdf5f46edb9ae9655086c4e49fa7f3f9fddb298",
      startBlock: 19988290,
      abi: mergeAbis([ProxyAbi, RiskEngineRouterAbi]),
    },
  },
});
