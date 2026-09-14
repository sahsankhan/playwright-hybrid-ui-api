import { Page, expect } from '@playwright/test';
import { config } from '../config/env';
import { healLocator, testId } from '../healing/locator';
import { BasePage } from './base.page';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(`${config.uiBaseUrl}/checkout`);
  }

  async expectProductInCart(productName: string): Promise<void> {
    const title = await healLocator([
      ...testId(this.page, 'product-title'),
      { name: 'product title text', locator: this.page.getByText(productName, { exact: false }) },
    ]);
    await expect(title).toContainText(productName);
  }

  async proceedFromCart(): Promise<void> {
    const proceed = await healLocator([
      ...testId(this.page, 'proceed-1'),
      { name: 'checkout button', locator: this.page.getByRole('button', { name: /proceed|checkout/i }) },
    ]);
    await proceed.click();
  }

  async proceedWhenLoggedIn(): Promise<void> {
    const proceed = await healLocator([
      ...testId(this.page, 'proceed-2'),
      { name: 'already signed in proceed', locator: this.page.getByRole('button', { name: /proceed|checkout/i }) },
    ]);
    await proceed.click();
  }

  async fillAddress(address = {
    country: 'NL',
    postalCode: '3511AB',
    houseNumber: '12',
    street: 'Test Street',
    city: 'Utrecht',
    state: 'Utrecht',
  }): Promise<void> {
    const country = await healLocator(testId(this.page, 'country'));
    await country.selectOption({ value: address.country }).catch(async () => {
      await country.selectOption({ label: /netherlands/i });
    });
    await this.fillTestId('postal_code', address.postalCode);
    await this.fillTestId('house_number', address.houseNumber);
    await this.fillTestId('street', address.street);
    await this.fillTestId('city', address.city);
    await this.fillTestId('state', address.state);
  }

  async proceedFromAddress(): Promise<void> {
    const proceed = await healLocator([
      ...testId(this.page, 'proceed-3'),
      { name: 'address proceed', locator: this.page.getByRole('button', { name: /proceed|checkout/i }) },
    ]);
    await expect(proceed).toBeEnabled({ timeout: config.timeouts.actionMs });
    await proceed.click();
  }

  async payCashOnDelivery(): Promise<void> {
    const method = await healLocator(testId(this.page, 'payment-method'));
    await method.selectOption('cash-on-delivery');
    const finish = await healLocator([
      ...testId(this.page, 'finish'),
      { name: 'confirm payment', locator: this.page.getByRole('button', { name: /confirm|finish|pay/i }) },
    ]);
    await expect(finish).toBeEnabled({ timeout: config.timeouts.actionMs });
    await finish.click();
  }

  async expectOrderConfirmed(): Promise<void> {
    const confirmation = await healLocator([
      ...testId(this.page, 'payment-success-message'),
      { name: 'order-confirmation', locator: this.page.locator('#order-confirmation') },
      { name: 'invoice text', locator: this.page.getByText(/invoice|payment was successful|thank you/i) },
    ]);
    await expect(confirmation).toBeVisible();
  }
}
