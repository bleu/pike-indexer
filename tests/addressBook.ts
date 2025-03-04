import {
  arbitrumSepolia,
  baseSepolia,
  berachainTestnetbArtio,
  monadTestnet,
  optimismSepolia,
} from 'viem/chains';

export const CONTRACT_ADDRESSES = {
  [baseSepolia.id]: {
    pTokens: [
      '0x15696822B30C54C787a0Fdce2C6AEA2AB47E2220',
      '0xA275ACB5ac2277a48Fe498113A7aD13c499657fe',
      '0x4999fcd9fd8E255AB8c3d2Cb9951E0322D038860',
    ],
    riskEngine: '0x8Fc240c810Fc3f7E4D966c45dd0e875863EA6305',
    oracleEngine: '0xD543b55490ed139a7FD3774f33c794341DB46FaA',
    factory: '0xF5b46BCB51963B8A7e0390a48C1D6E152A78174D',
  },
  [optimismSepolia.id]: {
    pTokens: [
      '0xC3936499098420177C075738b9495d62b4524085',
      '0x8273C719955943d26690fFC45Ba319E37379a92a',
      '0xced18911E41fe9ea5964462B800DA612143fc5D0',
    ],
    riskEngine: '0x87213f55e55a435416Af1519BacFd4DAe1f36aD5',
    oracleEngine: '0x33644276BF9af79AA98A26EC552f13E46B6C99f1',
    factory: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA',
  },
  [arbitrumSepolia.id]: {
    pTokens: [
      '0xC3936499098420177C075738b9495d62b4524085',
      '0x8273C719955943d26690fFC45Ba319E37379a92a',
      '0xced18911E41fe9ea5964462B800DA612143fc5D0',
    ],
    riskEngine: '0x87213f55e55a435416Af1519BacFd4DAe1f36aD5',
    oracleEngine: '0x33644276BF9af79AA98A26EC552f13E46B6C99f1',
    factory: '0x82072C90aacbb62dbD7A0EbAAe3b3e5D7d8cEEEA',
  },
  [berachainTestnetbArtio.id]: {
    pTokens: [
      '0x1D5cc310843C484C8021f990fAAf4353E05eB93c',
      '0x89eAbc1e5Bd1c4c9f1fe69cd538276Dec19BBC8D',
      '0xd0d1eA8099EE9faab42e71Dc3E2D95bBE81a078D',
    ],
    riskEngine: '0x2FD9753F0c4406536Dbec4d307979ea4b5D8E016',
    oracleEngine: '0x5ea59495dA9B648e61A81842214D950a0B36EE96',
    factory: '0x0e2ef7AEEef695F9c8D463ce31561B43EC14e453',
  },
  [monadTestnet.id]: {
    pTokens: [
      '0x1D5cc310843C484C8021f990fAAf4353E05eB93c',
      '0x89eAbc1e5Bd1c4c9f1fe69cd538276Dec19BBC8D',
      '0xd0d1eA8099EE9faab42e71Dc3E2D95bBE81a078D',
    ],
    riskEngine: '0x2FD9753F0c4406536Dbec4d307979ea4b5D8E016',
    oracleEngine: '0x5ea59495dA9B648e61A81842214D950a0B36EE96',
    factory: '0x0e2ef7AEEef695F9c8D463ce31561B43EC14e453',
  },
};
