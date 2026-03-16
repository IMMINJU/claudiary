function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  get DATABASE_URL() {
    return requireEnv("DATABASE_URL");
  },
  get AUTH_SECRET() {
    return requireEnv("AUTH_SECRET");
  },
  get AUTH_GITHUB_ID() {
    return requireEnv("AUTH_GITHUB_ID");
  },
  get AUTH_GITHUB_SECRET() {
    return requireEnv("AUTH_GITHUB_SECRET");
  },
} as const;
