# @pike/api-react-client

Pike API React Client (@pike/api-react-client) extends [@ponder/react](https://ponder-docs-git-kjs-live-ponder-sh.vercel.app/docs/query/react) to provide specialized React hooks for Pike Finance protocols. It offers type-safe hooks for fetching and subscribing to protocol metrics, built on top of Tanstack Query and @pike/api-client.

## Table of Contents

- [Installation](#installation)
- [Features](#features)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Examples](#examples)

## Installation (WIP)

Install @pike/api-react-client and its peer dependencies:

```bash
# npm
npm install @pike/api-react-client @pike/api-client @ponder/react @ponder/client @tanstack/react-query
```

## Features

- Built on top of [@ponder/react](https://ponder-docs-git-kjs-live-ponder-sh.vercel.app/docs/query/react)
- Type-safe React hooks for Pike protocol metrics
- Automatic live updates through Server-Sent Events (SSE)
- Seamless integration with Tanstack Query for state management
- Full TypeScript support

## Quick Start

### Create client

First, create a Pike API client using your Ponder server URL:

```typescript
// lib/pike.ts
import { createApiClient } from '@pike/api-client';
import * as schema from '../../ponder/ponder.schema';

const client = createApiClient(
  'https://pike-indexer-production.up.railway.app/'
);

export { client, schema };
```

### Setup Providers

Wrap your app with both PonderProvider and QueryClientProvider:

```typescript
// app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PonderProvider } from '@ponder/react';
import { client } from './lib/pike';

const queryClient = new QueryClient();

function App() {
  return (
    <PonderProvider client={client}>
      <QueryClientProvider client={queryClient}>
        {/** Your app components */}
      </QueryClientProvider>
    </PonderProvider>
  );
}
```

### Use the Hooks

```typescript
// components/UserMetrics.tsx
import { useUserMetrics, useUserProtocolMetrics } from '@pike/api-react-client';

export function UserMetrics({ userId }: { userId: string }) {
  const {
    data: metrics,
    isLoading,
    error
  } = useUserMetrics(userId);

  if (isLoading) return <div>Loading metrics...</div>;
  if (error) return <div>Error loading metrics</div>;

  return (
    <div>
      <h2>Net Metrics</h2>
      <p>Net APY: {metrics?.netMetrics.netAPY}%</p>
      <p>Net Worth: ${metrics?.netMetrics.netWorth}</p>
    </div>
  );
}

export function ProtocolMetrics({
  userId,
  protocolId
}: {
  userId: string;
  protocolId: string;
}) {
  const {
    data: protocolMetrics,
    isLoading,
    error
  } = useUserProtocolMetrics(userId, protocolId);

  if (isLoading) return <div>Loading protocol metrics...</div>;
  if (error) return <div>Error loading protocol metrics</div>;

  return (
    <div>
      <h2>Protocol Metrics</h2>
      <p>Health Index: {protocolMetrics?.healthIndex}</p>
      <p>Net APY: {protocolMetrics?.netAPY}%</p>
    </div>
  );
}
```

## API Reference

### Hooks

#### useUserMetrics

Fetches and subscribes to comprehensive metrics for a user across all protocols.

```typescript
const {
  data,
  isLoading,
  error,
  ...queryResult
} = useUserMetrics(
  userId: string,
  options?: UseQueryOptions
);
```

Returns: [UseQueryResult](https://tanstack.com/query/latest/docs/react/reference/useQuery) with the following data structure:

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

#### useUserProtocolMetrics

Fetches and subscribes to detailed metrics for a user's position in a specific protocol.

```typescript
const {
  data,
  isLoading,
  error,
  ...queryResult
} = useUserProtocolMetrics(
  userId: string,
  protocolId: string,
  options?: UseQueryOptions
);
```

## Examples

### Dashboard Component

```typescript
// components/Dashboard.tsx
import { useUserMetrics } from '@pike/api-react-client';

export function Dashboard({ userId }: { userId: string }) {
  const { data: metrics } = useUserMetrics(userId);

  return (
    <div>
      <h1>User Dashboard</h1>

      {/* Net Position Summary */}
      <div>
        <h2>Net Position</h2>
        <div>Net Worth: ${metrics?.netMetrics.netWorth}</div>
        <div>Net APY: {metrics?.netMetrics.netAPY}%</div>
      </div>

      {/* Protocol Breakdown */}
      <div>
        <h2>Protocol Breakdown</h2>
        {metrics?.protocolMetrics.map(protocol => (
          <div key={protocol.protocolId}>
            <h3>Protocol {protocol.protocolId}</h3>
            <div>Health Index: {protocol.healthIndex}</div>
            <div>Net APY: {protocol.netAPY}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Using with Existing Ponder Queries

The package is fully compatible with existing @ponder/react hooks:

```typescript
import { usePonderQuery } from '@ponder/react';
import { useUserMetrics } from '@pike/api-react-client';
import { schema } from '../lib/pike';

export function CombinedView({ userId }: { userId: string }) {
  // Pike metrics
  const { data: metrics } = useUserMetrics(userId);

  // Direct Ponder query
  const { data: events } = usePonderQuery({
    queryFn: (db) => db
      .select()
      .from(schema.userBalance)
      .where(eq(schema.userBalance.userId, userId))
      .limit(10),
  });

  return (
    <div>
      {/* Render combined data */}
    </div>
  );
}
```
