import { ponder } from 'ponder:registry';
import { eventSetups } from '../../tests/events-setup';

type EventNames = Parameters<typeof ponder.on>[0];
type EventHandler = Parameters<typeof ponder.on>[1];

export const registerEvent = <T extends EventNames>(
  eventName: T,
  handler: any,
  testEventId?: string
) => {
  // Always register in non-test environments
  if (process.env.INDEXER_ENV !== 'test') {
    ponder.on(eventName, handler);
    return;
  }

  // Handle test environment
  const [contractName, eventPart] = String(eventName).split(':');

  const eventId = testEventId ? testEventId : `${contractName}_${eventPart}`;
  const modifiedHandler: EventHandler = async params => {
    const setupFn = eventSetups[eventId];
    if (setupFn) {
      console.log(`Running test setup for event: ${String(eventName)}`);
      await setupFn(params);
      console.log(`Test setup completed for event: ${String(eventName)}`);
    }

    return handler(params);
  };

  const testVarName = `TEST_EVENT_${eventId}`;

  if (process.env[testVarName] === 'true') {
    ponder.on(eventName, modifiedHandler);
  }
};
