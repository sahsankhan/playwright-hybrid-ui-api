import 'dotenv/config';
import type { AppConfig, EnvironmentName } from './types';

const environments: Record<EnvironmentName, Omit<AppConfig, 'customer' | 'timeouts'>> = {
  demo: {
    name: 'demo',
    uiBaseUrl: 'https://practicesoftwaretesting.com',
    apiBaseUrl: 'https://api.practicesoftwaretesting.com',
  },
  staging: {
    name: 'staging',
    uiBaseUrl: process.env.UI_BASE_URL ?? 'https://practicesoftwaretesting.com',
    apiBaseUrl: process.env.API_BASE_URL ?? 'https://api.practicesoftwaretesting.com',
  },
};

function resolveEnvName(): EnvironmentName {
  const raw = (process.env.TEST_ENV ?? 'demo').toLowerCase();
  if (raw === 'demo' || raw === 'staging') {
    return raw;
  }
  throw new Error(`Unknown TEST_ENV "${raw}". Use demo or staging.`);
}

export function loadConfig(): AppConfig {
  const name = resolveEnvName();
  const base = environments[name];

  return {
    ...base,
    uiBaseUrl: process.env.UI_BASE_URL ?? base.uiBaseUrl,
    apiBaseUrl: process.env.API_BASE_URL ?? base.apiBaseUrl,
    customer: {
      email: process.env.CUSTOMER_EMAIL ?? 'customer@practicesoftwaretesting.com',
      password: process.env.CUSTOMER_PASSWORD ?? 'welcome01',
    },
    timeouts: {
      actionMs: Number(process.env.ACTION_TIMEOUT_MS ?? 15_000),
      navigationMs: Number(process.env.NAVIGATION_TIMEOUT_MS ?? 30_000),
      healMs: Number(process.env.HEAL_TIMEOUT_MS ?? 3_000),
    },
  };
}

export const config = loadConfig();
