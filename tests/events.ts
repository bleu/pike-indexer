export type EventConfigMap = Record<string, number>;

export const EVENTS: Record<string, EventConfigMap> = {
  '84532': {
    RiskEngineFromFactoryV0_NewEModeConfiguration: 20382014,
    RiskEngineFromFactoryV0_EModeUpdated: 20382013,
    RiskEngineFromFactoryV0_EModeSwitched: 20381088,
    Factory_ProtocolDeployed_V0: 19991778,
    Factory_ProtocolDeployed_V1: 20518090,
    RiskEngineFromFactoryV0_MarketListed: 19991789, // https://sepolia.basescan.org/tx/0xfa261ea0288267ab0849d6b5e15f724991d647bdfb078bc6262a68569c82c9ee
    PToken_Deposit: 22209282, // https://sepolia.basescan.org/tx/0x52b36d955ae2b68ec208ee134e9bbd053eadfb8dd66361be8d492bbdb7f3a1c9
    PToken_Borrow: 20254035, // https://sepolia.basescan.org/tx/0x95093526e00fe27ddac87066514efd6379f2a12eb997ca97030e7befc00f24f1
    PToken_RepayBorrow: 22445342, // https://sepolia.basescan.org/tx/0xd2f991027e80b42cda21a91f5d8d04eae28d05914a739e8093449d0de3822d2e
    PToken_Withdraw: 22655733, // https://sepolia.basescan.org/tx/0x8196d193dd09595ad1cf3b799c3845790328626ec89f9cc6afbd32170895e330
  },
  '11155420': {},
};
