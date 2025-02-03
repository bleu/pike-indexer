import { schema } from '@pike/api-client';
import { usePonderQuery } from '@ponder/react';

export function PTokenListPage() {
  const { data, isError, isPending } = usePonderQuery({
    queryFn: db => db.select().from(schema.pToken).limit(10),
  });

  if (isPending) return <div>Loading pTokens</div>;
  if (isError) return <div>Error fetching deposits</div>;

  return data.map(pToken => (
    <div key={pToken.id}>
      <h3>{pToken.name}</h3>
      <p>{pToken.symbol}</p>
    </div>
  ));
}
