import { ponder } from 'ponder:registry';

type EventNames = Parameters<typeof ponder.on>[0];

export const registerEvent = <T extends EventNames>(
  eventName: T,
  handler: any,
  testEnvVarName?: string
) => {
  // Always register in non-test environments
  if (process.env.NODE_ENV !== 'test') {
    ponder.on(eventName, handler);
    return;
  }

  const [contractName, eventPart] = String(eventName).split(':');

  // In test environment, only register if the specific event test flag is enabled
  const testVarName = testEnvVarName
    ? `TEST_EVENT_${testEnvVarName}`
    : `TEST_EVENT_${contractName}_${eventPart}`;

  console.log('testVarName', testVarName);
  if (process.env[testVarName] === 'true') {
    console.log(`Registering test event handler for ${String(eventName)}`);
    ponder.on(eventName, handler);
  } else {
    console.log(
      `Skipping event registration for ${String(eventName)} in test mode`
    );
  }
};
