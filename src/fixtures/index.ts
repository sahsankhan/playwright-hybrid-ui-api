import { test as base } from '@playwright/test';
import { ShopApi, type CartSeed } from '../api/shop-api';
import { CheckoutPage } from '../pages/checkout.page';

type HybridFixtures = {
  api: ShopApi;
  seededCheckout: CartSeed;
  checkoutPage: CheckoutPage;
};

export const test = base.extend<HybridFixtures>({
  api: async ({ request }, use) => {
    await use(new ShopApi(request));
  },

  seededCheckout: async ({ api, page }, use) => {
    const seed = await api.seedLoggedInCart();

    await page.addInitScript(
      ({ token, cartId, quantity }) => {
        window.localStorage.setItem('auth-token', token);
        window.sessionStorage.setItem('cart_id', cartId);
        window.sessionStorage.setItem('cart_quantity', JSON.stringify(quantity));
      },
      {
        token: seed.token,
        cartId: seed.cartId,
        quantity: seed.quantity,
      },
    );

    await use(seed);
  },

  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
});

export { expect } from '@playwright/test';
