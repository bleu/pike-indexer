export const PTokenAbi = [
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
    name: 'baseRatePerSecond',
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
    name: 'configureInterestRateModel',
    inputs: [
      {
        name: 'baseRatePerYear',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'multiplierPerYear',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'firstJumpMultiplierPerYear',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'secondJumpMultiplierPerYear',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'firstKink',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'secondKink',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'getBorrowRate',
    inputs: [
      {
        name: 'cash',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'borrows',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'reserves',
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
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'getSupplyRate',
    inputs: [
      {
        name: 'cash',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'borrows',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'reserves',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'reserveFactorMantissa',
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
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'getUtilization',
    inputs: [
      {
        name: 'cash',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'borrows',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'reserves',
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
    stateMutability: 'pure',
  },
  {
    type: 'function',
    name: 'kinks',
    inputs: [],
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
    name: 'multipliers',
    inputs: [],
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
    stateMutability: 'pure',
  },
  {
    type: 'event',
    name: 'NewInterestParams',
    inputs: [
      {
        name: 'baseRatePerSecond',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'multiplierPerSecond',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'firstJumpMultiplierPerSecond',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'secondJumpMultiplierPerSecond',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'firstKink',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'secondKink',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'InvalidKinkOrMultiplierOrder',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InvalidMultiplierForNonZeroBaseRate',
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
    type: 'error',
    name: 'ZeroValue',
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
    type: 'function',
    name: 'accrualBlockTimestamp',
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
    name: 'accrueInterest',
    inputs: [],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'addReserves',
    inputs: [
      {
        name: 'addAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'spender',
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
    name: 'approve',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'asset',
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
    name: 'balanceOf',
    inputs: [
      {
        name: 'owner',
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
    name: 'balanceOfUnderlying',
    inputs: [
      {
        name: 'owner',
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
    name: 'borrow',
    inputs: [
      {
        name: 'borrowAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'borrowBalanceCurrent',
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
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'borrowBalanceStored',
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
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'borrowIndex',
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
    name: 'borrowOnBehalfOf',
    inputs: [
      {
        name: 'onBehalfOf',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'borrowAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'borrowRatePerSecond',
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
    name: 'configuratorReserves',
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
    name: 'configuratorReservesCurrent',
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
    name: 'convertToAssets',
    inputs: [
      {
        name: 'shares',
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
    name: 'convertToShares',
    inputs: [
      {
        name: 'assets',
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
    name: 'decimals',
    inputs: [],
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
    name: 'deposit',
    inputs: [
      {
        name: 'mintAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'exchangeRateCurrent',
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
    name: 'exchangeRateStored',
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
    name: 'getAccountSnapshot',
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
    name: 'getCash',
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
    name: 'initialize',
    inputs: [
      {
        name: 'underlying_',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'riskEngine_',
        type: 'address',
        internalType: 'contract IRiskEngine',
      },
      {
        name: 'initialExchangeRateMantissa_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'reserveFactorMantissa_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'protocolSeizeShareMantissa_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'borrowRateMaxMantissa_',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'name_',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'symbol_',
        type: 'string',
        internalType: 'string',
      },
      {
        name: 'decimals_',
        type: 'uint8',
        internalType: 'uint8',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'liquidateBorrow',
    inputs: [
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
      {
        name: 'pTokenCollateral',
        type: 'address',
        internalType: 'contract IPToken',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'maxDeposit',
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
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'maxMint',
    inputs: [
      {
        name: 'receiver',
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
    name: 'maxRedeem',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        internalType: 'address',
      },
    ],
    outputs: [
      {
        name: 'maxShares',
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
        name: 'owner',
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
    name: 'mint',
    inputs: [
      {
        name: 'tokenAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'name',
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
    name: 'ownerReserves',
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
    name: 'ownerReservesCurrent',
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
    name: 'previewDeposit',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'previewMint',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'previewRedeem',
    inputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'previewWithdraw',
    inputs: [
      {
        name: 'assets',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [
      {
        name: 'shares',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'protocolSeizeShareMantissa',
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
    name: 'redeem',
    inputs: [
      {
        name: 'redeemTokens',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'owner',
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reduceReservesConfigurator',
    inputs: [
      {
        name: 'reduceAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reduceReservesEmergency',
    inputs: [
      {
        name: 'reduceAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reduceReservesOwner',
    inputs: [
      {
        name: 'reduceAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'repayBorrow',
    inputs: [
      {
        name: 'repayAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'repayBorrowOnBehalfOf',
    inputs: [
      {
        name: 'onBehalfOf',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'repayAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'reserveFactorMantissa',
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
    name: 'riskEngine',
    inputs: [],
    outputs: [
      {
        name: '',
        type: 'address',
        internalType: 'contract IRiskEngine',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'seize',
    inputs: [
      {
        name: 'liquidator',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'borrower',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'seizeTokens',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setProtocolSeizeShare',
    inputs: [
      {
        name: 'newProtocolSeizeShareMantissa',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setReserveFactor',
    inputs: [
      {
        name: 'newReserveFactorMantissa',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'setRiskEngine',
    inputs: [
      {
        name: 'newRiskEngine',
        type: 'address',
        internalType: 'contract IRiskEngine',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'supplyRatePerSecond',
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
    name: 'sweepToken',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'contract IERC20',
      },
    ],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'symbol',
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
    name: 'totalAssets',
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
    name: 'totalBorrows',
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
    name: 'totalBorrowsCurrent',
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
    name: 'totalReserves',
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
    name: 'totalReservesCurrent',
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
    name: 'totalSupply',
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
    name: 'transfer',
    inputs: [
      {
        name: 'dst',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'transferFrom',
    inputs: [
      {
        name: 'src',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'dst',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'amount',
        type: 'uint256',
        internalType: 'uint256',
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
    name: 'withdraw',
    inputs: [
      {
        name: 'redeemAmount',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'receiver',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'owner',
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
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    name: 'AccrueInterest',
    inputs: [
      {
        name: 'cashPrior',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalReserves',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'borrowIndex',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalBorrows',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Approval',
    inputs: [
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'spender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Borrow',
    inputs: [
      {
        name: 'borrower',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'onBehalfOf',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'borrowAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'accountBorrows',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalBorrows',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Deposit',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'assets',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'shares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'LiquidateBorrow',
    inputs: [
      {
        name: 'liquidator',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'borrower',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'repayAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'pTokenCollateral',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'seizeTokens',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewProtocolSeizeShare',
    inputs: [
      {
        name: 'oldProtocolSeizeShareMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newProtocolSeizeShareMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewReserveFactor',
    inputs: [
      {
        name: 'oldReserveFactorMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newReserveFactorMantissa',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'NewRiskEngine',
    inputs: [
      {
        name: 'oldRiskEngine',
        type: 'address',
        indexed: false,
        internalType: 'contract IRiskEngine',
      },
      {
        name: 'newRiskEngine',
        type: 'address',
        indexed: false,
        internalType: 'contract IRiskEngine',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'RepayBorrow',
    inputs: [
      {
        name: 'payer',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'onBehalfOf',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'repayAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'accountBorrows',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'totalBorrows',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ReservesAdded',
    inputs: [
      {
        name: 'benefactor',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'addAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newTotalReserves',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'ReservesReduced',
    inputs: [
      {
        name: 'admin',
        type: 'address',
        indexed: false,
        internalType: 'address',
      },
      {
        name: 'reduceAmount',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'newTotalReserves',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Transfer',
    inputs: [
      {
        name: 'from',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'to',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'value',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'event',
    name: 'Withdraw',
    inputs: [
      {
        name: 'sender',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'receiver',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'owner',
        type: 'address',
        indexed: true,
        internalType: 'address',
      },
      {
        name: 'assets',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
      {
        name: 'shares',
        type: 'uint256',
        indexed: false,
        internalType: 'uint256',
      },
    ],
    anonymous: false,
  },
  {
    type: 'error',
    name: 'AddReservesFactorFreshCheck',
    inputs: [],
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
    name: 'AddressInsufficientBalance',
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
    name: 'AlreadyInitialized',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BorrowCashNotAvailable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BorrowFreshnessCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'BorrowRiskEngineRejection',
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
    name: 'DelegateNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'FailedInnerCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'InsufficientAllowance',
    inputs: [
      {
        name: 'spender',
        type: 'address',
        internalType: 'address',
      },
      {
        name: 'allowance',
        type: 'uint256',
        internalType: 'uint256',
      },
      {
        name: 'needed',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
  {
    type: 'error',
    name: 'InvalidRedeemTokens',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidateAccrueCollateralInterestFailed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidateCalculateAmountSeizeFailed',
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
    name: 'LiquidateCloseAmountIsUintMax',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidateCloseAmountIsZero',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidateCollateralFreshnessCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidateFreshnessCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidateLiquidatorIsBorrower',
    inputs: [],
  },
  {
    type: 'error',
    name: 'LiquidateRiskEngineRejection',
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
    name: 'LiquidateSeizeRiskEngineRejection',
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
    name: 'LiquidateSeizeTooMuch',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MintFreshnessCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'MintRiskEngineRejection',
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
    name: 'RedeemFreshnessCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RedeemRiskEngineRejection',
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
    name: 'RedeemTransferOutNotPossible',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReduceReservesCashNotAvailable',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReduceReservesCashValidation',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReduceReservesFreshCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'ReentrancyGuardReentrantCall',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RepayBorrowFreshnessCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'RepayBorrowRiskEngineRejection',
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
    name: 'SafeERC20FailedOperation',
    inputs: [
      {
        name: 'token',
        type: 'address',
        internalType: 'address',
      },
    ],
  },
  {
    type: 'error',
    name: 'SetReserveFactorBoundsCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SetReserveFactorFreshCheck',
    inputs: [],
  },
  {
    type: 'error',
    name: 'SweepNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TransferNotAllowed',
    inputs: [],
  },
  {
    type: 'error',
    name: 'TransferRiskEngineRejection',
    inputs: [
      {
        name: 'errorCode',
        type: 'uint256',
        internalType: 'uint256',
      },
    ],
  },
] as const;
