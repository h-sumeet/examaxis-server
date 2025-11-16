// Get required environment variable
export const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }
  return value;
};

// Get required number from environment variable
export const getRequiredEnvNumber = (key: string): number => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Required environment variable ${key} is not set`);
  }

  // Check if the value is a valid integer (including negative numbers, no letters, decimals, or scientific notation)
  if (!/^-?\d+$/.test(value.trim())) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }

  const parsed = parseInt(value.trim(), 10);
  if (isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid number`);
  }
  return parsed;
};
