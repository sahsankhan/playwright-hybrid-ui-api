import { Page } from '@playwright/test';
import { healLocator, testId } from '../healing/locator';

export class BasePage {
  constructor(protected readonly page: Page) {}

  protected async clickTestId(id: string): Promise<void> {
    const locator = await healLocator(testId(this.page, id));
    await locator.click();
  }

  protected async fillTestId(id: string, value: string): Promise<void> {
    const locator = await healLocator(testId(this.page, id));
    await locator.fill(value);
  }
}
