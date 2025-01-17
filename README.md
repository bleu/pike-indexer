# Pike Markets Indexer

> ⚠️ **WARNING: Work in Progress**
> This project is in active development. Features, APIs, and documentation are subject to rapid and significant changes.
> Production use is not recommended at this stage.

## Overview

Pike Markets Indexer is a multi-chain data indexing solution built with [Ponder](https://ponder.sh/), designed to track and serve Pike Markets-related on-chain information. It follows the GraphQL pattern with supplementary REST endpoints for user metrics.

The indexer is currently being developed against Pike Markets contracts deployed on Base Sepolia testnet. As the protocol evolves and deploys to additional networks, the indexer will be updated to support them.

The latest deploy of the API is on [https://pike-indexer-production.up.railway.app/](https://pike-indexer-production.up.railway.app/).

### Key Features

- Multi-chain indexing support for Pike Markets data
- GraphQL API for market and user data
- Supplementary REST endpoints for complex user metrics
- Real-time price information updates
- Historical data tracking for APRs and token prices
- E-mode functionality support

#### GraphQL

The primary interface following the schema defined [here](https://www.drawdb.app/editor?shareId=2b0a33e19ef0e294d2c3c7e0f8ee1947).

#### REST Metrics Endpoints

There are two endpoints to calculate user metrics using latest updated data. The metrics are:

- `borrowUsdValue`: Sum of all borrow assets multiplied by the latest fetched price.
- `supplyUsdValue`: Sum of all borrow assets multiplied by the latest fetched price.
- `supplyAPY`: Current Annual Percentage Yield that the supply assets are suggested to.
- `borrowAPY`: Current annual interest that the borrow assets are suggested to.
- `APY`: Sum of `supplyAPY` and `borrowAPY` weighted using USD values. This follow this [reference](https://gist.github.com/ajb413/a6f89486ec5485746cd5eac1e10e4fc2).
- `healthIndex`: How close the user is from liquidation considering all markets collateral, borrows and liquidation threshold. For more information check this [reference](https://medium.com/@dipruv/health-factors-63f424d9b91#:~:text=Dec%201%2C%202021-,Health%20Factor,be%20liquidated%20to%20maintain%20solvency.). It only exists on the protocol level.
- `worth`: Difference between `borrowUsdValue` and `supplyUsdValue`.

The `net` prefix means that is related with multiple protocols or markets.

- `user/<userId>/metrics`: High level APR and USD user metrics considering all protocols. The `userId` parameter is given by `<userAddress>-<chainId>`.
- `/user/<userId>/protocol/<protocolId>/metrics`: Protocol level metrics of

### Installation

```bash
# Install dependencies
pnpm install

# Create environment file
cp .env.example .env.local

# Create auto generated data from config and schema
pnpm codegen

# Check .env.example for required environment variables

# Start development server
pnpm dev
```
