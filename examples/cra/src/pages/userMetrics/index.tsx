import { useUserMetrics } from '@pike/api-react-client';
import { useWeb3Info } from 'hooks/useWeb3Info';
import { useMemo } from 'react';

export function UserMetricsPage() {
  const { chainId, account } = useWeb3Info();

  const userId = useMemo(() => {
    return `${chainId}-${account}`;
  }, [chainId, account]);

  const { data: metrics, isLoading, error } = useUserMetrics(userId);

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
