import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PonderProvider } from '@ponder/react';
import { createApiClient } from '@pike/api-client';

const queryClient = new QueryClient();
const client = createApiClient('http://localhost:42069/sql');

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PonderProvider client={client}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </PonderProvider>
  );
}
