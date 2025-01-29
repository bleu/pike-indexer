# @pike/utils

The @pike/utils package provides base utilities for calculating various metrics, interacting with Pike smart contracts, and expose contract ABIs. This package includes tools for computing health indices, APY rates, and implementing interest rate models. It was made to be a standalone package that can be integrated on any TS environment.

## Table of Contents

- [@pike/utils](#pikeutils)
  - [Table of Contents](#table-of-contents)
  - [Installation (WIP)](#installation-wip)
  - [Features](#features)
  - [Smart Contract ABIs](#smart-contract-abis)
  - [Metrics Calculations](#metrics-calculations)
    - [Health Index](#health-index)
    - [APY Calculations](#apy-calculations)
    - [USD Value Calculations](#usd-value-calculations)
  - [Interest Rate Models](#interest-rate-models)
    - [Double Jump Rate Model](#double-jump-rate-model)

## Installation (WIP)

```bash
npm install @pike/utils
```

## Features

- Smart contract ABIs for all Pike contracts
- Comprehensive metrics calculations (health index, APY, USD values)
- Interest rate model implementations
- Utilities for token conversions and mathematical operations

## Smart Contract ABIs

The SDK provides access to all Pike smart contract ABIs. These can be imported directly from the package:

```typescript
import { PTokenABI, ControllerABI } from '@pike/utils';
```

All contract ABIs are typed and include full documentation for each method and event.

## Metrics Calculations

Pike SDK includes a comprehensive suite of utilities for calculating various DeFi metrics. These calculations are essential for understanding user positions, risk assessment, and portfolio management.

### Health Index

The health index represents the overall safety of a user's position. A value below 1 indicates risk of liquidation.

```typescript
import { calculateUserMetricsOnProtocol } from '@pike/utils';

const metrics = calculateUserMetricsOnProtocol(userData);
console.log(metrics.healthIndex); // e.g., "1.5"
```

For more details about health index calculation, see [this reference](https://gist.github.com/ajb413/a6f89486ec5485746cd5eac1e10e4fc2).

### APY Calculations

Calculate various APY metrics including supply APY, borrow APY, and net APY:

```typescript
import { calculateNetMetrics } from '@pike/utils';

const netMetrics = calculateNetMetrics([
  {
    borrowAPY: '0.05', // 5%
    supplyAPY: '0.03', // 3%
    borrowUsdValue: '1000',
    supplyUsdValue: '2000',
  },
]);

console.log(netMetrics.netAPY); // Net APY considering all positions
```

The APY is calculated using the current rate of the contracts and multiplying by one year.

### USD Value Calculations

Convert token amounts to USD values with proper decimal handling (18 decimals):

```typescript
import { calculateUsdValueFromAssets } from '@pike/utils';

const usdValue = calculateUsdValueFromAssets(
  1000000000000000000n, // 1 token in wei
  2000000000000000000n // $2 USD price in wei
);
console.log(usdValue); // "2.0"
```

## Interest Rate Models

Pike SDK implements various interest rate models used by the protocol. Currently, it supports the Double Jump Rate model with more models planned for future releases.

### Double Jump Rate Model

This model implements a three-slope interest rate curve with two kink points:

```typescript
import { DoubleJumpRateModel } from '@pike/utils';

const model = new DoubleJumpRateModel({
  cash: 1000000n,
  totalBorrows: 500000n,
  totalReserves: 10000n,
  baseRatePerSecond: 0n,
  multiplierPerSecond: 100000000n,
  firstJumpMultiplierPerSecond: 200000000n,
  secondJumpMultiplierPerSecond: 300000000n,
  firstKink: 800000000000000000n, // 0.8 in wei
  secondKink: 900000000000000000n, // 0.9 in wei
});

const borrowRate = model.getBorrowRate();
const supplyRate = model.getSupplyRate();
const utilization = model.getUtilization();
```

The Double Jump Rate Model uses three slopes to determine interest rates:

1. Base slope up to the first kink
2. Steeper slope between first and second kink
3. Steepest slope above the second kink

This design encourages optimal capital utilization while protecting the protocol during high utilization periods.

For more details about interest rate models, see [the Pike documentation]().
