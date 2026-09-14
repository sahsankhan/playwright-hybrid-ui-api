import { test, expect } from '../../src/fixtures';

test.describe('Shop API', () => {
  test('lists in-stock products', async ({ api }) => {
    const products = await api.listProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(products.some((product) => product.in_stock)).toBeTruthy();
  });

  test('registers a unique customer and returns a bearer token', async ({ api }) => {
    const account = await api.registerUniqueCustomer();
    expect(account.token).toBeTruthy();
    expect(account.email).toContain('qa.hybrid.');
  });
});
