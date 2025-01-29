# Pike Integration Monorepo

> ⚠️ **WARNING: Work in Progress**
> This project is in active development. Features, APIs, and documentation are subject to rapid and significant changes.
> Production use is not recommended at this stage.

This repository is a monorepo containing packages and applications designed to facilitate integrations with the Pike lending protocol. It provides essential tools, utilities, and applications for developers looking to build on top of or interact with Pike Markets.

## Overview

The Pike Integration Monorepo is structured to provide a comprehensive suite of tools for interacting with Pike lending protocol:

- **Core Utilities**: Base calculation engines and contract interfaces
- **API Clients**: Type-safe clients for interacting with Pike's indexer
- **Applications**: Full-featured applications including multi-chain indexing solutions

## Applications

### Pike Indexer

Pike Markets Indexer is a robust multi-chain data indexing solution built with [Ponder](https://ponder.sh/). It serves as the backbone for tracking and querying Pike Markets-related on-chain information across multiple blockchains.

**Key Features:**

- Multi-chain data indexing and synchronization
- GraphQL API for flexible data querying
- Supplementary REST endpoints for user metrics
- Real-time event processing and indexing
- Comprehensive historical data access

For detailed information about the indexer, please refer to the [app documentation](./packages/ponder-app/README.md).

## Packages

### @pike/utils

The `@pike/utils` package serves as the foundation for Pike protocol interactions, providing essential utilities for calculations and smart contract interactions.

**Key Features:**

- Health index calculation utilities
- APY rate computation tools
- Interest rate model implementations
- Smart contract ABIs and interfaces
- Standalone TypeScript implementation
- Chain-agnostic design

This package is designed to be integrated into any TypeScript environment. For comprehensive documentation, see the [package documentation](./packages/utils/README.md).

### @pike/api-client

Pike API Client (`@pike/api-client`) extends [@ponder/client](https://ponder-docs-git-kjs-live-ponder-sh.vercel.app/docs/query/client) to provide specialized functionality for Pike Finance protocols.

**Key Features:**

- Type-safe database queries
- Live updates and subscriptions
- Comprehensive DeFi metrics calculations
- Automatic type generation
- Built-in caching and optimization

For detailed information about the API client, consult the [package documentation](./packages/api-client/README.md).

### Upcoming Packages

#### @pike/api-react-client (Not Started)

React-specific bindings and hooks for the Pike API client. This package will provide React components and hooks for seamless integration with React applications.

#### @pike/viem (Not Started)

Custom viem actions and utilities for reading and write information from Pike smart contracts.

#### @pike/wagmi (Not Started)

Wagmi hooks and utilities for Pike protocol integration into React frontend.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

Built with ♥ by bleu
