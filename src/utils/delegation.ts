import { Context } from 'ponder:registry';
import { userDelegation } from 'ponder:schema';

export function createOrDeleteDelegation(
  context: Context,
  params: typeof userDelegation.$inferSelect,
  approved: boolean
) {
  if (approved) {
    return context.db
      .insert(userDelegation)
      .values(params)
      .onConflictDoNothing();
  }
  return context.db.delete(userDelegation, { id: params.id });
}
