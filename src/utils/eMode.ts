import { Context } from 'ponder:registry';
import { pTokenEMode } from 'ponder:schema';

export function upsertOrDeletePTokenEMode(
  context: Context,
  params: typeof pTokenEMode.$inferSelect
) {
  if (params.borrowEnabled || params.collateralEnabled) {
    return context.db
      .insert(pTokenEMode)
      .values(params)
      .onConflictDoUpdate(params);
  }

  // delete the entry if both borrow and deposit are disabled
  return context.db.delete(pTokenEMode, { id: params.id }).catch(e => {
    console.warn('Error deleting pTokenEMode', e);
  });
}
