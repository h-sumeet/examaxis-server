export const ENV: Record<string, string> = {
  dev: "development",
  prod: "production",
} as const;

export const GITHUB_EMAIL_API = "https://api.github.com/user/emails" as const;

export const AUTH_PROVIDERS = {
  GITHUB: "github",
  GOOGLE: "google",
} as const;

export const LOGIN_CODE_EXPIRY_MINUTES = 5 as const;
