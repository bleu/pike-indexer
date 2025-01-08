# Pike Markets Indexer

> ⚠️ **WARNING: Work in Progress**
> This project is in active development. Features, APIs, and documentation are subject to rapid and significant changes.
> Production use is not recommended at this stage.

## Overview

Pike Markets Indexer is a multi-chain data indexing solution built with [Ponder](https://ponder.sh/), designed to track and serve Pike Markets-related on-chain information. It follows the GraphQL pattern with supplementary REST endpoints for user metrics.

The indexer is currently being developed against Pike Markets contracts deployed on Base Sepolia testnet. As the protocol evolves and deploys to additional networks, the indexer will be updated to support them.

### Key Features (WIP)

- Multi-chain indexing support for Pike Markets data
- GraphQL API for market and user data
- Supplementary REST endpoints for complex user metrics
- Real-time price information updates
- Historical data tracking for APRs and token prices
- E-mode functionality support

#### GraphQL

The primary interface following the schema defined [here](https://www.drawdb.app/editor?shareId=2b0a33e19ef0e294d2c3c7e0f8ee1947).

#### REST Endpoints

- `/balances/:user`: User balance records with USD values
- `/user/:user`: Comprehensive user metrics including:
  - Total borrowed/supplied USD value
  - Utilization percentage
  - Health factor
  - APR calculations

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
