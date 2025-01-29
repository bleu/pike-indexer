'use client';

import {
  type UseQueryOptions,
  type UseQueryResult,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { useContext, useEffect, useMemo } from 'react';
import { PonderContext } from '@ponder/react';
import { PikeApiClient } from '@pike/api-client';
import { Client } from '@ponder/client';

function isPikeApiClient(client: Client): client is PikeApiClient {
  return 'getUserMetrics' in client && 'getUserProtocolMetrics' in client;
}

export function useUserMetrics(
  userId: string,
  params: Omit<
    UseQueryOptions<
      Awaited<ReturnType<PikeApiClient['getUserMetrics']>>,
      Error
    >,
    'queryFn' | 'queryKey'
  > = {}
): UseQueryResult<Awaited<ReturnType<PikeApiClient['getUserMetrics']>>, Error> {
  const queryClient = useQueryClient();
  const client = useContext(PonderContext);

  if (client === undefined) {
    throw new Error('PonderProvider not found');
  }

  if (!isPikeApiClient(client)) {
    throw new Error('Provider client is not a PikeApiClient');
  }

  const queryKey = useMemo(() => ['user-metrics', userId], [userId]);

  useEffect(() => {
    const { unsubscribe } = client.live(
      () => Promise.resolve(),
      () => queryClient.invalidateQueries({ queryKey })
    );
    return unsubscribe;
  }, [queryKey, client, queryClient]);

  return useQuery({
    ...params,
    queryKey,
    queryFn: () => client.getUserMetrics(userId),
  });
}

export function useUserProtocolMetrics(
  userId: string,
  protocolId: string,
  params: Omit<
    UseQueryOptions<
      Awaited<ReturnType<PikeApiClient['getUserProtocolMetrics']>>,
      Error
    >,
    'queryFn' | 'queryKey'
  > = {}
): UseQueryResult<
  Awaited<ReturnType<PikeApiClient['getUserProtocolMetrics']>>,
  Error
> {
  const queryClient = useQueryClient();
  const client = useContext(PonderContext);

  if (client === undefined) {
    throw new Error('PonderProvider not found');
  }

  if (!isPikeApiClient(client)) {
    throw new Error('Provider client is not a PikeApiClient');
  }

  const queryKey = useMemo(
    () => ['user-protocol-metrics', userId, protocolId],
    [userId, protocolId]
  );

  useEffect(() => {
    const { unsubscribe } = client.live(
      () => Promise.resolve(),
      () => queryClient.invalidateQueries({ queryKey })
    );
    return unsubscribe;
  }, [queryKey, client, queryClient]);

  return useQuery({
    ...params,
    queryKey,
    queryFn: () => client.getUserProtocolMetrics(userId, protocolId),
  });
}
