export function validateEnvKeys(keys: string[]) {
  const missingKeys = keys.filter(key => !process.env[key]);

  if (missingKeys.length > 0) {
    throw new Error(`Missing environment keys: ${missingKeys.join(', ')}`);
  }
}
