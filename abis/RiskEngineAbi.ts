export const RiskEngineAbi = [
  {
    name: 'facets',
    type: 'function',
    stateMutability: 'pure',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          {
            type: 'address',
            name: 'facetAddress',
          },
          {
            type: 'bytes4[]',
            name: 'functionSelectors',
          },
        ],
      },
    ],
  },
  {
    name: 'facetFunctionSelectors',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      {
        type: 'address',
        name: 'facet',
      },
    ],
    outputs: [
      {
        type: 'bytes4[]',
        name: 'functionSelectors',
      },
    ],
  },
  {
    name: 'facetAddresses',
    type: 'function',
    stateMutability: 'pure',
    inputs: [],
    outputs: [
      {
        type: 'address[]',
        name: 'addresses',
      },
    ],
  },
  {
    name: 'facetAddress',
    type: 'function',
    stateMutability: 'pure',
    inputs: [
      {
        type: 'bytes4',
        name: 'functionSelector',
      },
    ],
    outputs: [
      {
        type: 'address',
      },
    ],
  },
  {
    name: 'emitDiamondCutEvent',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [
      {
        type: 'bool',
      },
    ],
  },
  {
    type: 'constructor',
    inputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'acceptOwnership',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'initialize',
    inputs: [
      {
        name: 'initialOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'nominateNewOwner',
    inputs: [
      {
        name: 'newNominatedOwner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'pendingOwner',
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
    name: 'renounceNomination',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
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
    name: 'OwnerChanged',
    inputs: [
      {
        name: 'oldOwner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newOwner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'OwnerNominated',
    inputs: [
      {
        name: 'newOwner',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyNominated',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidInitialization',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotInitializing',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotNominated',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotPendingOwner',
    inputs: [],
  },
  {
    type: 'error',
    name: 'Unauthorized',
    inputs: [
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'ZeroAddress',
    inputs: [],
  },
  {
    type: 'function',
    name: 'grantNestedPermission',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'nestedAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'grantPermission',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'hasNestedPermission',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'nestedAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'hasPermission',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'revokeNestedPermission',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'nestedAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'revokePermission',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: 'target',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'NestedPermissionGranted',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'nestedAddress',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'target',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NestedPermissionRevoked',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'nestedAddress',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'target',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PermissionGranted',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'target',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'PermissionRevoked',
    inputs: [
      {
        name: 'permission',
        type: 'bytes32',
        indexed: false,
        internalType: 'bytes32',
      },
      {
        name: 'target',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyGranted',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyRevoked',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidPermission',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NestedPermissionDenied',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'PermissionDenied',
    inputs: [
      {
        name: '',
        type: 'bytes32',
        internalType: 'bytes32',
      },
      {
        name: '',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'function',
    name: 'accountCategory',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'borrowAllowed',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'borrower',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'borrowAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'borrowCap',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'checkBorrowMembership',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'checkCollateralMembership',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'closeFactor',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'collateralFactor',
    inputs: [
      {
        name: 'categoryId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
    ],
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
    name: 'configureEMode',
    inputs: [
      {
        name: 'categoryId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'baseConfig',
        type: 'tuple',
        internalType: 'struct IRiskEngine.BaseConfiguration',
        components: [
          {
            name: 'collateralFactorMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationThresholdMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationIncentiveMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'configureMarket',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
      {
        name: 'baseConfig',
        type: 'tuple',
        internalType: 'struct IRiskEngine.BaseConfiguration',
        components: [
          {
            name: 'collateralFactorMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationThresholdMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationIncentiveMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'delegateAllowed',
    inputs: [
      {
        name: 'user',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'delegate',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'enterMarkets',
    inputs: [
      {
        name: 'pTokens',
        type: 'address[]',
        internalType: 'address[]',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'exitMarket',
    inputs: [
      {
        name: 'pTokenAddress',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getAccountBorrowLiquidity',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
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
    name: 'getAccountLiquidity',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
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
    name: 'getAllMarkets',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'contract IPToken[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getAssetsIn',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'address[]',
        internalType: 'contract IPToken[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'getHypotheticalAccountLiquidity',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pTokenModify',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'redeemTokens',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'borrowAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
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
    name: 'getReserveShares',
    inputs: [],
    outputs: [
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
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isDeprecated',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'liquidateBorrowAllowed',
    inputs: [
      {
        name: 'pTokenBorrowed',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pTokenCollateral',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'borrower',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'repayAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'liquidateCalculateSeizeTokens',
    inputs: [
      {
        name: 'borrower',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pTokenBorrowed',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pTokenCollateral',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'actualRepayAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'uint256',
        internalType: 'uint256',
      },
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
    name: 'liquidationIncentive',
    inputs: [
      {
        name: 'categoryId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'liquidationThreshold',
    inputs: [
      {
        name: 'categoryId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
    ],
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
    name: 'maxWithdraw',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'mintAllowed',
    inputs: [
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'mintAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'oracle',
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
    name: 'redeemAllowed',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'redeemer',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'redeemTokens',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'repayBorrowAllowed',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'repayBorrowVerify',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
      {
        name: 'account',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'seizeAllowed',
    inputs: [
      {
        name: 'pTokenCollateral',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'pTokenBorrowed',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'setBorrowPaused',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
      {
        name: 'state',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setCloseFactor',
    inputs: [
      {
        name: 'pTokenAddress',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'newCloseFactorMantissa',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMarketBorrowCaps',
    inputs: [
      {
        name: 'pTokens',
        type: 'address[]',
        internalType: 'contract IPToken[]',
      },
      {
        name: 'newBorrowCaps',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMarketSupplyCaps',
    inputs: [
      {
        name: 'pTokens',
        type: 'address[]',
        internalType: 'contract IPToken[]',
      },
      {
        name: 'newSupplyCaps',
        type: 'uint256[]',
        internalType: 'uint256[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setMintPaused',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
      {
        name: 'state',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setOracle',
    inputs: [
      {
        name: 'newOracle',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setReserveShares',
    inputs: [
      {
        name: 'newOwnerShareMantissa',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'newConfiguratorShareMantissa',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setSeizePaused',
    inputs: [
      {
        name: 'state',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setTransferPaused',
    inputs: [
      {
        name: 'state',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [
      {
        name: '',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supplyCap',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
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
    name: 'supportEMode',
    inputs: [
      {
        name: 'categoryId',
        type: 'uint8',
        internalType: 'uint8',
      },
      {
        name: 'isAllowed',
        type: 'bool',
        internalType: 'bool',
      },
      {
        name: 'pTokens',
        type: 'address[]',
        internalType: 'address[]',
      },
      {
        name: 'collateralPermissions',
        type: 'bool[]',
        internalType: 'bool[]',
      },
      {
        name: 'borrowPermissions',
        type: 'bool[]',
        internalType: 'bool[]',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supportMarket',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'contract IPToken',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'switchEMode',
    inputs: [
      {
        name: 'newCategoryId',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'transferAllowed',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'src',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'transferTokens',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
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
    name: 'updateDelegate',
    inputs: [
      {
        name: 'delegate',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'approved',
        type: 'bool',
        internalType: 'bool',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'ActionPaused',
    inputs: [
      {
        name: 'action',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'pauseState',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ActionPaused',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        indexed: false,
        internalType: 'contract IPToken',
      },
      {
        name: 'action',
        type: 'string',
        indexed: false,
        internalType: 'string',
      },
      {
        name: 'pauseState',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'DelegateUpdated',
    inputs: [
      {
        name: 'approver',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'delegate',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'approved',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EModeSwitched',
    inputs: [
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'oldCategory',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'newCategory',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'EModeUpdated',
    inputs: [
      {
        name: 'categoryId',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'pToken',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'allowed',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'collateralStatus',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
      {
        name: 'borrowStatus',
        type: 'bool',
        indexed: false,
        internalType: 'bool',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MarketEntered',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        indexed: false,
        internalType: 'contract IPToken',
      },
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MarketExited',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        indexed: false,
        internalType: 'contract IPToken',
      },
      {
        name: 'account',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'MarketListed',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        indexed: false,
        internalType: 'contract IPToken',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewBorrowCap',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        indexed: true,
        internalType: 'contract IPToken',
      },
      {
        name: 'newBorrowCap',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewCloseFactor',
    inputs: [
      {
        name: 'oldCloseFactorMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newCloseFactorMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewEModeConfiguration',
    inputs: [
      {
        name: 'categoryId',
        type: 'uint8',
        indexed: false,
        internalType: 'uint8',
      },
      {
        name: 'oldConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct IRiskEngine.BaseConfiguration',
        components: [
          {
            name: 'collateralFactorMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationThresholdMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationIncentiveMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'newConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct IRiskEngine.BaseConfiguration',
        components: [
          {
            name: 'collateralFactorMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationThresholdMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationIncentiveMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewMarketConfiguration',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        indexed: false,
        internalType: 'contract IPToken',
      },
      {
        name: 'oldConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct IRiskEngine.BaseConfiguration',
        components: [
          {
            name: 'collateralFactorMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationThresholdMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationIncentiveMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
      {
        name: 'newConfig',
        type: 'tuple',
        indexed: false,
        internalType: 'struct IRiskEngine.BaseConfiguration',
        components: [
          {
            name: 'collateralFactorMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationThresholdMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
          {
            name: 'liquidationIncentiveMantissa',
            type: 'uint256',
            internalType: 'uint256',
          },
        ],
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewOracleEngine',
    inputs: [
      {
        name: 'oldOracleEngine',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'newOracleEngine',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewReserveShares',
    inputs: [
      {
        name: 'newOwnerShareMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newConfiguratorShareMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewSupplyCap',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        indexed: true,
        internalType: 'contract IPToken',
      },
      {
        name: 'newSupplyCap',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AlreadyInEMode',
    inputs: [],
  },
  {
    type: 'error',
    name: 'AlreadyListed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BorrowPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'DelegationStatusUnchanged',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ExitMarketRedeemRejection',
    inputs: [
      {
        name: 'errorCode',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidBorrowStatus',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidCategory',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidCollateralFactor',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidCollateralStatus',
    inputs: [
      {
        name: 'pToken',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidLiquidationThreshold',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidReserveShare',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MarketNotListed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MintPaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NoArrayParity',
    inputs: [],
  },
  {
    type: 'error',
    name: 'NotListed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RepayMoreThanBorrowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SeizePaused',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SenderNotPToken',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SwitchEMode',
    inputs: [
      {
        name: 'errorCode',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'TransferPaused',
    inputs: [],
  },
] as const;
