import { ponder } from 'ponder:registry';

ponder.on('CurrentPriceUpdate:block', async ({ context, event }) => {
  // TODO: Wait until Ponder 0.9 is released since the db querier will be changed
});
