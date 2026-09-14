import { test } from '../../src/fixtures';

test.describe('Checkout journey', () => {
  test('API seeds login + cart, UI completes cash-on-delivery checkout @e2e', async ({
    seededCheckout,
    checkoutPage,
  }) => {
    await checkoutPage.open();
    await checkoutPage.expectProductInCart(seededCheckout.product.name);
    await checkoutPage.proceedFromCart();
    await checkoutPage.proceedWhenLoggedIn();
    await checkoutPage.fillAddress();
    await checkoutPage.proceedFromAddress();
    await checkoutPage.payCashOnDelivery();
    await checkoutPage.expectOrderConfirmed();
  });
});
