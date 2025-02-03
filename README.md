# Pike Markets Indexer

## Overview

Pike Markets Indexer is a multi-chain data indexing solution built with [Ponder](https://ponder.sh/), designed to track and serve Pike Markets-related on-chain information. It follows the GraphQL pattern with supplementary REST endpoints for user metrics.

The indexer is currently being developed against Pike Markets contracts deployed on Base Sepolia testnet. As the protocol evolves and deploys to additional networks, the indexer will be updated to support them.

The latest deploy of the API is on [https://pike-indexer-production.up.railway.app/](https://pike-indexer-production.up.railway.app/).

### Key Features

- Multi-chain indexing support for Pike Markets data
- GraphQL API for market and user data
- Real-time price information updates
- Historical data tracking for APRs and token prices
- E-mode functionality support

For documentation of columns and tables, descriptions were integrated on the GraphQL endpoints.

### Integration (WIP)

For integration we suggest use the `@pike/api-client` package. The documentation of the package can be accessed [here](../api-client/README.md). As you might have noted, health index, APY, current USD values are not available on the schema, however they can be calculated from the data. This metric calculations are also available on the `@pike/api-client` package.

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
