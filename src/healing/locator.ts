import { Locator, Page } from '@playwright/test';
import { config } from '../config/env';

export type LocatorCandidate = {
  name: string;
  locator: Locator;
};

export async function healLocator(candidates: LocatorCandidate[], timeoutMs = config.timeouts.healMs): Promise<Locator> {
  const errors: string[] = [];

  for (const candidate of candidates) {
    try {
      await candidate.locator.waitFor({ state: 'visible', timeout: timeoutMs });
      if (candidate !== candidates[0]) {
        console.warn(`[self-heal] primary locator missed; using fallback "${candidate.name}"`);
      }
      return candidate.locator;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${candidate.name}: ${message.split('\n')[0]}`);
    }
  }

  throw new Error(`Self-heal exhausted all locators:\n- ${errors.join('\n- ')}`);
}

export function testId(page: Page, id: string): LocatorCandidate[] {
  return [
    { name: `data-test=${id}`, locator: page.locator(`[data-test="${id}"]`) },
    { name: `data-testid=${id}`, locator: page.locator(`[data-testid="${id}"]`) },
    { name: `id=${id}`, locator: page.locator(`#${id}`) },
  ];
}

export async function withRetry<T>(
  action: () => Promise<T>,
  attempts = 3,
  delayMs = 500,
  shouldRetry: (error: unknown) => boolean = () => true,
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await action();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !shouldRetry(error)) {
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
  throw lastError;
}
