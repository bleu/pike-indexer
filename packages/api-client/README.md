# @pike/api-client

Pike API Client (@pike/api-client) is a TypeScript package that extends [@ponder/client](https://ponder-docs-git-kjs-live-ponder-sh.vercel.app/docs/query/client) to provide specialized queries and metrics calculations for Pike Finance protocols. It offers type-safe database queries, live updates, and comprehensive DeFi metrics calculations.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Advanced Usage](#advanced-usage)

## Installation (WIP)

```bash
npm install @pike/api-client
```

## Features

- Built on top of [@ponder/client](https://ponder-docs-git-kjs-live-ponder-sh.vercel.app/docs/query/client) for type-safe database queries
- Specialized functions for Pike protocol metrics
- Live updates support through Server-Sent Events (SSE)
- Comprehensive user metrics calculations across protocols using @pike/utils methods

## Quick Start

```typescript
import { PikeApiClient } from '@pike/api-client';

// Initialize the client with your Ponder server URL
const client = new PikeApiClient('http://localhost:42069');

// Fetch user metrics
const metrics = await client.getUserMetrics('0x123...abc');
console.log(metrics.netMetrics.netAPY); // e.g., "5.2"
```

## API Reference

### PikeApiClient

The main class that provides access to Pike-specific queries and the underlying Ponder client.

#### Constructor

```typescript
const client = new PikeApiClient(url: string);
```

#### Methods

##### getUserMetrics

Fetches comprehensive metrics for a user across all protocols.

```typescript
const metrics = await client.getUserMetrics(userId: string);
```

Returns:

```typescript
{
  protocolMetrics: Array<{
    protocolId: string;
    healthIndex: string;
    netBorrowUsdValue: string;
    netSupplyUsdValue: string;
    netBorrowAPY: string;
    netSupplyAPY: string;
    netAPY: string;
    pTokenMetrics: Array<{
      pTokenId: string;
      storedBorrowAssets: bigint;
      supplyAssets: bigint;
      borrowUsdValue: string;
      supplyUsdValue: string;
    }>;
  }>;
  netMetrics: {
    netBorrowUsdValue: string;
    netSupplyUsdValue: string;
    netBorrowAPY: string;
    netSupplyAPY: string;
    netAPY: string;
    netWorth: string;
  }
}
```

##### getUserProtocolMetrics

Fetches detailed metrics for a user's position in a specific protocol.

```typescript
const protocolMetrics = await client.getUserProtocolMetrics(
  userId: string,
  protocolId: string
);
```

### Direct Ponder Client Access

You can access the underlying @ponder/client instance directly for custom queries:

```typescript
import { and, eq } from '@ponder/client';

// Custom query using the underlying Ponder client
const result = await client.client.db
  .select()
  .from(schema.userBalance)
  .where(eq(schema.userBalance.userId, '0x123...abc'));

// Subscribe to live updates
const { unsubscribe } = client.client.live(
  db => db.select().from(schema.userBalance),
  result => {
    console.log('New data:', result);
  }
);
```
