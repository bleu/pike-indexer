import {
  extendWithBaseDefinitions,
  generateTypeDocSet,
} from 'ponder-enrich-gql-docs-middleware';

const docs = extendWithBaseDefinitions({
  ...generateTypeDocSet('protocol', 'core protocol configuration and state', {
    'protocol.id':
      'Unique identifier for the protocol composed by <riskEngineAddress>-<chainId>',
    'protocol.chainId': 'The blockchain network identifier',
    'protocol.protocolId':
      'Protocol-specific identifier on the factory address',
    'protocol.riskEngine': 'Address of the risk engine',
    'protocol.timelock': 'Address of the timelock contract',
    'protocol.initialGovernor': 'Address of the initial protocol governor',
    'protocol.configuratorShare':
      'Share allocated to protocol configurator with 18 decimals',
    'protocol.ownerShare': 'Share allocated to protocol owner with 18 decimals',
    'protocol.oracle': 'Address of the price oracle engine contract',
    'protocol.isBorrowPaused': 'Indicates if borrowing is paused',
    'protocol.isMintPaused': 'Indicates if minting is paused',
    'protocol.isTransferPaused': 'Indicates if transfers are paused',
    'protocol.isSeizePaused': 'Indicates if seizing collateral is paused',
  }),

  ...generateTypeDocSet('pToken', 'pike token market information and state', {
    'pToken.id':
      'Unique identifier for the protocol token composed by <pTokenAddress>-<chainId>',
    'pToken.address': 'Contract address of the token',
    'pToken.symbol': 'Token symbol',
    'pToken.name': 'Token name',
    'pToken.decimals': 'Number of decimal places',
    'pToken.liquidationThreshold':
      'Multiplier representing the collateralization after which the borrow is eligible for liquidation. For instance, 0.8 liquidate when the borrow is 80% of collateral value. This can be override by the e-mode.',
    'pToken.liquidationIncentive':
      'Multiplier representing the discount on collateral that a liquidator receives. Can be override by the e-mode.',
    'pToken.collateralFactor':
      ' Multiplier representing the most one can borrow against their collateral in this market. For instance, 0.9 to allow borrowing 90% of collateral value. Can be override by the e-mode.',
    'pToken.reserveFactor': 'Reserve factor percentage',
    'pToken.protocolSeizeShare': "Protocol's share of liquidation proceeds",
    'pToken.closeFactor': 'How close the account must be to liquidation',
    'pToken.supplyCap': 'Maximum amount that can be supplied',
    'pToken.borrowCap': 'Maximum amount that can be borrowed',
    'pToken.exchangeRateStored':
      'The latest stored exchange rate to underlying',
    'pToken.utilization': 'Current utilization rate between borrow and supply',
    'pToken.borrowRatePerSecond':
      'Per-second borrowing rate dependent of the rate model',
    'pToken.supplyRatePerSecond':
      'Per-second supply rate dependent of the rate model',
    'pToken.borrowRateAPY':
      'Annual borrowing interest rate, derived from per-second rate',
    'pToken.supplyRateAPY':
      'Annual supply interest rate, derived from per-second rate',
    'pToken.borrowIndex':
      'Latest interest accumulation index for borrows saved',
    'pToken.cash': 'Current amount of underlying asset',
    'pToken.totalSupply': 'Total supply of pTokens',
    'pToken.totalReserves': 'Total reserves of underlying asset',
    'pToken.totalBorrows': 'Total amount borrowed of the underlying asset',
    'pToken.underlyingPriceCurrent':
      'Latest price of underlying asset using the protocol oracle engine. This is periodically updated. The price is a bigint that if fixed point multiplied by the underlying token balance gives the USD value with 18 decimals. In instance, if the underlying token has 18 decimals the price is also in 18 decimals, if the underlying token has 6 decimals the price is in 30 decimals.',
    'pToken.formattedUnderlyingPriceCurrent':
      'Latest price of underlying asset in numeric format',
    'pToken.totalBorrowUsdValue': 'Total USD value of borrows',
    'pToken.totalSupplyUsdValue': 'Total USD value of supply',
    'pToken.baseRatePerSecond': 'Base interest rate per second',
    'pToken.multiplierPerSecond': 'Interest rate multiplier per second',
    'pToken.firstJumpMultiplierPerSecond': 'First jump rate multiplier',
    'pToken.secondJumpMultiplierPerSecond': 'Second jump rate multiplier',
    'pToken.firstKink': 'Utilization point of first rate jump',
    'pToken.secondKink': 'Utilization point of second rate jump',
  }),

  ...generateTypeDocSet(
    'eMode',
    'efficiency mode configuration of one protocol',
    {
      'eMode.id':
        'Unique identifier for the e-mode composed by <protocolRiskEngineAddress>-<eModeCategoryId>-<chainId>',
      'eMode.chainId': 'The blockchain network identifier',
      'eMode.protocolId': 'Protocol identifier',
      'eMode.categoryId': 'Category identifier',
      'eMode.collateralFactor':
        'Multiplier representing the most one can borrow against their collateral in this market. For instance, 0.9 to allow borrowing 90% of collateral value. If is active it overrides the pToken data.',
      'eMode.liquidationThreshold':
        'Multiplier representing the collateralization after which the borrow is eligible for liquidation. For instance, 0.8 liquidate when the borrow is 80% of collateral value. If is active it overrides the pToken data',
      'eMode.liquidationIncentive':
        'Multiplier representing the discount on collateral that a liquidator receives. If is active it overrides the pToken data',
    }
  ),

  ...generateTypeDocSet('beaconProxy', 'proxy contract information', {
    'beaconProxy.id': 'Unique identifier for the beacon proxy',
    'beaconProxy.chainId': 'The blockchain network identifier',
    'beaconProxy.beaconAddress': 'Address of the beacon contract',
    'beaconProxy.implementationAddress':
      'Address of the implementation contract',
  }),

  ...generateTypeDocSet('pTokenEMode', 'protocol token e-mode settings', {
    'pTokenEMode.id':
      'Unique identifier for the token e-mode composed by <pTokenAddress>-<protocolRiskEngineAddress>-<eModeCategoryId>-<chainId>',
    'pTokenEMode.chainId': 'The blockchain network identifier',
    'pTokenEMode.pTokenId': 'Pike token (pToken) identifier',
    'pTokenEMode.eModeId': 'E-mode identifier',
    'pTokenEMode.borrowEnabled': 'Whether borrowing is enabled in this e-mode',
    'pTokenEMode.collateralEnabled':
      'Whether collateral usage is enabled in this e-mode',
  }),

  ...generateTypeDocSet('actionPaused', 'market pause action tracking', {
    'actionPaused.id': 'Unique identifier for the pause action',
    'actionPaused.chainId': 'The blockchain network identifier',
    'actionPaused.protocolId': 'Protocol identifier (if protocol-wide pause)',
    'actionPaused.pTokenId':
      'Pike token (pToken) identifier (if token-specific pause)',
    'actionPaused.action': 'Type of action that is paused',
    'actionPaused.pauseState': 'Whether the action is currently paused',
    'actionPaused.transactionId': 'Transaction that triggered the pause state',
  }),

  ...generateTypeDocSet('user', 'user account information', {
    'user.id': 'Unique identifier for the user composed by its address',
    'user.address': "User's blockchain address",
    'user.chainId': 'The blockchain network identifier',
  }),

  ...generateTypeDocSet('userDelegation', 'user delegation relationships', {
    'userDelegation.id':
      'Unique identifier for the delegation composed by <userAddress>-<delegateAddress>-<chainId>',
    'userDelegation.chainId': 'The blockchain network identifier',
    'userDelegation.userId': 'User identifier',
    'userDelegation.protocolId': 'Protocol identifier',
    'userDelegation.delegateAddress': 'Address of the delegate',
  }),

  ...generateTypeDocSet('userEMode', 'user e-mode settings', {
    'userEMode.id':
      'Unique identifier for the user e-mode composed by <userAddress>-<eModeCategoryId>-<chainId>',
    'userEMode.chainId': 'The blockchain network identifier',
    'userEMode.userId': 'User identifier',
    'userEMode.eModeId': 'E-mode identifier',
  }),

  ...generateTypeDocSet('userBalance', 'user position in one pToken market', {
    'userBalance.id':
      'Unique identifier for the balance record composed by <userAddress>-<pTokenAddress>-<chainId>',
    'userBalance.chainId': 'The blockchain network identifier',
    'userBalance.userId': 'User identifier',
    'userBalance.pTokenId': 'Pike token (pToken) identifier',
    'userBalance.supplyShares': 'Number of supply shares owned (pTokens)',
    'userBalance.borrowAssets': 'Amount of assets borrowed (underlying)',
    'userBalance.isCollateral': 'Whether the position is used as collateral',
    'userBalance.interestIndex': 'Latest saved interest accumulation index',
    'userBalance.updatedAt': 'Last update timestamp',
  }),

  ...generateTypeDocSet('deposit', 'deposit transaction information', {
    'deposit.id':
      'Unique identifier for the deposit composed by <transactionHash>-<logIndex>',
    'deposit.transactionId': 'Associated transaction identifier',
    'deposit.chainId': 'The blockchain network identifier',
    'deposit.pTokenId': 'Pike token (pToken) identifier',
    'deposit.minter': 'Address that performed the mint',
    'deposit.userId': 'User identifier',
    'deposit.assets': 'Amount of assets deposited (underlying)',
    'deposit.shares': 'Number of shares minted (pTokens)',
    'deposit.usdValue': 'USD value of the deposit',
  }),

  ...generateTypeDocSet('withdraw', 'withdrawal transaction information', {
    'withdraw.id':
      'Unique identifier for the withdrawal composed by <transactionHash>-<logIndex>',
    'withdraw.transactionId': 'Associated transaction identifier',
    'withdraw.chainId': 'The blockchain network identifier',
    'withdraw.pTokenId': 'Pike token (pToken) identifier',
    'withdraw.sender': 'Address initiating the withdrawal',
    'withdraw.receiver': 'Address receiving the assets',
    'withdraw.userId': 'User identifier',
    'withdraw.assets': 'Amount of assets withdrawn (underlying)',
    'withdraw.shares': 'Number of shares burned (pTokens)',
    'withdraw.usdValue': 'USD value of the withdrawal',
  }),

  ...generateTypeDocSet('borrow', 'borrow transaction information', {
    'borrow.id':
      'Unique identifier for the borrow composed by <transactionHash>-<logIndex>',
    'borrow.transactionId': 'Associated transaction identifier',
    'borrow.chainId': 'The blockchain network identifier',
    'borrow.pTokenId': 'Pike token (pToken) identifier',
    'borrow.borrower': 'Address that performed the borrow',
    'borrow.userId': 'User identifier',
    'borrow.borrowAssets': 'Amount of assets borrowed (underlying)',
    'borrow.accountBorrows':
      'Total borrows for the account in the market (underlying)',
    'borrow.totalBorrows': 'Total borrows for the market (underlying)',
    'borrow.usdValue': 'USD value of the borrow',
  }),

  ...generateTypeDocSet('repayBorrow', 'repayment transaction information', {
    'repayBorrow.id':
      'Unique identifier for the repayment composed by <transactionHash>-<logIndex>',
    'repayBorrow.transactionId': 'Associated transaction identifier',
    'repayBorrow.chainId': 'The blockchain network identifier',
    'repayBorrow.pTokenId': 'Pike token (pToken) identifier',
    'repayBorrow.payer': 'Address that performed the repayment',
    'repayBorrow.userId': 'User identifier',
    'repayBorrow.repayAssets': 'Amount of assets repaid (underlying)',
    'repayBorrow.accountBorrows':
      'Remaining borrows for the account in the market (underlying)',
    'repayBorrow.totalBorrows':
      'Updated total borrows for the market (underlying)',
    'repayBorrow.usdValue': 'USD value of the repayment',
  }),

  ...generateTypeDocSet(
    'liquidateBorrow',
    'liquidation transaction information',
    {
      'liquidateBorrow.id':
        'Unique identifier for the liquidation composed by <transactionHash>-<logIndex>',
      'liquidateBorrow.transactionId': 'Associated transaction identifier',
      'liquidateBorrow.chainId': 'The blockchain network identifier',
      'liquidateBorrow.liquidatorId': "Liquidator's identifier",
      'liquidateBorrow.borrowerId': "Borrower's identifier",
      'liquidateBorrow.borrowPTokenId': 'Borrowed token identifier',
      'liquidateBorrow.collateralPTokenId': 'Collateral token identifier',
      'liquidateBorrow.repayAssets': 'Amount of assets repaid (underlying)',
      'liquidateBorrow.seizeShares': 'Amount of collateral seized (pTokens)',
      'liquidateBorrow.repayUsdValue': 'USD value of the repayment',
      'liquidateBorrow.seizeUsdValue': 'USD value of the seized collateral',
    }
  ),

  ...generateTypeDocSet('transfer', 'ERC-20 pToken transfer information', {
    'transfer.id':
      'Unique identifier for the transfer composed by <transactionHash>-<logIndex>',
    'transfer.transactionId': 'Associated transaction identifier',
    'transfer.chainId': 'The blockchain network identifier',
    'transfer.pTokenId': 'Pike token (pToken) identifier',
    'transfer.fromId': "Sender's identifier",
    'transfer.toId': "Recipient's identifier",
    'transfer.shares': 'Number of shares transferred (pTokens)',
    'transfer.usdValue': 'USD value of the transfer',
  }),

  ...generateTypeDocSet('delegateUpdated', 'delegation update events', {
    'delegateUpdated.id':
      'Unique identifier for the delegate update composed by <transactionHash>-<logIndex>',
    'delegateUpdated.chainId': 'The blockchain network identifier',
    'delegateUpdated.userId': 'User identifier',
    'delegateUpdated.delegateAddress': 'Address of the delegate',
    'delegateUpdated.protocolId': 'Protocol identifier',
    'delegateUpdated.transactionId': 'Associated transaction identifier',
    'delegateUpdated.approved': 'Whether the delegation was approved',
  }),

  ...generateTypeDocSet('marketEntered', 'market entry events', {
    'marketEntered.id':
      'Unique identifier for the market entry composed by <transactionHash>-<logIndex>',
    'marketEntered.transactionId': 'Associated transaction identifier',
    'marketEntered.chainId': 'The blockchain network identifier',
    'marketEntered.pTokenId': 'Pike token (pToken) identifier',
    'marketEntered.userId': 'User identifier who entered the market',
  }),

  ...generateTypeDocSet('marketExited', 'market exit events', {
    'marketExited.id':
      'Unique identifier for the market exit composed by <transactionHash>-<logIndex>',
    'marketExited.transactionId': 'Associated transaction identifier',
    'marketExited.chainId': 'The blockchain network identifier',
    'marketExited.pTokenId': 'Pike token (pToken) identifier',
    'marketExited.userId': 'User identifier who exited the market',
  }),

  ...generateTypeDocSet('priceSnapshot', 'price history information', {
    'priceSnapshot.id':
      'Unique identifier for the price snapshot composed by <pTokenAddress>-<chainId>-<blockNumber>',
    'priceSnapshot.chainId': 'The blockchain network identifier',
    'priceSnapshot.pTokenId': 'Pike token (pToken) identifier',
    'priceSnapshot.timestamp': 'When the price was recorded',
    'priceSnapshot.price':
      'The recorded price value. The price is a bigint that if fixed point multiplied by the underlying token balance gives the USD value with 18 decimals. This meas that the price has 36 - D, where D is the token decimals. In instance, if the underlying token has 18 decimals the price is also in 18 decimals, if the underlying token has 6 decimals the price is in 30 decimals.',
    'priceSnapshot.formattedPrice':
      'The recorded price value in numeric format',
  }),

  ...generateTypeDocSet('aprSnapshot', 'interest rate history information', {
    'aprSnapshot.id':
      'Unique identifier for the APR snapshot composed by <pTokenAddress>-<chainId>-<blockNumber>',
    'aprSnapshot.chainId': 'The blockchain network identifier',
    'aprSnapshot.pTokenId': 'Pike token (pToken) identifier',
    'aprSnapshot.timestamp': 'When the rates were recorded',
    'aprSnapshot.borrowRatePerSecond': 'Borrowing rate per second',
    'aprSnapshot.supplyRatePerSecond': 'Supply rate per second',
  }),

  ...generateTypeDocSet(
    'underlyingToken',
    'base ERC20 underlying token information',
    {
      'underlyingToken.id':
        'Unique identifier for the underlying token composed by <underlyingTokenAddress>-<chainId>',
      'underlyingToken.symbol': 'Token symbol',
      'underlyingToken.name': 'Token name',
      'underlyingToken.decimals': 'Number of decimal places',
      'underlyingToken.address': 'Contract address of the token',
      'underlyingToken.chainId': 'The blockchain network identifier',
    }
  ),

  ...generateTypeDocSet(
    'transaction',
    'blockchain transaction metadata information',
    {
      'transaction.id':
        'Unique identifier for the transaction composed by <transactionHash>-<chainId>',
      'transaction.chainId': 'The blockchain network identifier',
      'transaction.transactionHash': 'Transaction hash',
      'transaction.timestamp': 'Transaction timestamp',
      'transaction.blockNumber': 'Block number containing the transaction',
      'transaction.blockHash': 'Hash of the block',
      'transaction.from': 'Transaction sender address',
      'transaction.to': 'Transaction recipient address',
      'transaction.gas': 'Gas used by the transaction',
      'transaction.gasPrice': 'Gas price for the transaction',
    }
  ),

  ...generateTypeDocSet('action', 'Types of actions that can be paused', {
    'action.Mint': 'Token minting operations',
    'action.Borrow': 'Borrowing operations',
    'action.Transfer': 'Token transfer operations',
    'action.Seize': 'Collateral seizure operations',
  }),
});

export default docs;
