export const FactoryAbi = [
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'UPGRADE_INTERFACE_VERSION',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'string',
        internalType: 'string',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'deployMarket',
    inputs: [
      {
        name: 'setupParams',
        type: 'tuple',
        internalType: 'struct IFactory.PTokenSetup',
        components: [
          {
            name: 'protocolId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'underlying',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialExchangeRateMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'reserveFactorMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'protocolSeizeShareMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'borrowRateMaxMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'name',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'symbol',
            type: 'string',
            internalType: 'string',
          },
          {
            name: 'decimals',
            type: 'uint8',
            internalType: 'uint8',
          },
        ],
      },
    ],
    outputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'deployProtocol',
    inputs: [
      {
        name: 'initialGovernor',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'ownerShareMantissa',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'configuratorShareMantissa',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'riskEngine',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'oracleEngine',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'governorTimelock',
        type: 'address',
        internalType: 'address payable',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getMarket',
    inputs: [
      {
        name: 'protocolId',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'index',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getProtocolInfo',
    inputs: [
      {
        name: 'protocolId',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        internalType: 'struct IFactory.ProtocolInfo',
        components: [
          {
            name: 'protocolId',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'numOfMarkets',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'protocolOwner',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'initialGovernor',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'riskEngine',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'oracleEngine',
            type: 'address',
            internalType: 'address',
          },
          {
            name: 'timelock',
            type: 'address',
            internalType: 'address',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: '_initialOwner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_riskEngineBeacon',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_oracleEngineBeacon',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_pTokenBeacon',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '_timelockBeacon',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'oracleEngineBeacon',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'owner',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'pTokenBeacon',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'protocolCount',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'proxiableUUID',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'renounceOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'riskEngineBeacon',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'timelockBeacon',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'transferOwnership',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'upgradeToAndCall',
    inputs: [
      {
        name: 'newImplementation',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'data',
        type: 'bytes',
        internalType: 'bytes',
      },
    ],
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'event',
    name: 'Initialized',
    inputs: [
      {
        name: 'version',
        type: 'uint64',
        indexed: false,
        internalType: 'uint64',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnershipTransferred',
    inputs: [
      {
        name: 'previousOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PTokenDeployed',
    inputs: [
      {
        name: 'protocolId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'index',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'pToken',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'timelock',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ProtocolDeployed',
    inputs: [
      {
        name: 'protocolId',
        type: 'uint256',
        indexed: true,
        internalType: 'uint256',
      },
      {
        name: 'riskEngine',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'timelock',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'initialGovernor',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Upgraded',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AddressEmptyCode',
    inputs: [
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967InvalidImplementation',
    inputs: [
      {
        name: 'implementation',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ERC1967NonPayable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedInnerCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidTimelock',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'OwnableInvalidOwner',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'OwnableUnauthorizedAccount',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnauthorizedCallContext',
    inputs: [],
  },
  {
    type: 'error',
    name: 'UUPSUnsupportedProxiableUUID',
    inputs: [
      {
        name: 'slot',
        type: 'bytes32',
        internalType: 'bytes32',
      },
    ],
  },
] as const;
