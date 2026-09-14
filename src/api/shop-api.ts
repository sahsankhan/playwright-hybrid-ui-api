import { APIRequestContext } from '@playwright/test';
import { config } from '../config/env';
import { withRetry } from '../healing/locator';

export type Product = {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
};

export type LoginResult = {
  access_token: string;
  token_type?: string;
};

export type CartSeed = {
  cartId: string;
  product: Product;
  quantity: number;
  token: string;
};

type Json = Record<string, unknown>;

export class ShopApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly baseUrl = config.apiBaseUrl,
  ) {}

  private url(path: string): string {
    return `${this.baseUrl}${path}`;
  }

  private isTransient(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return /ENOTFOUND|ECONNRESET|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|socket hang up|net::ERR_/i.test(message);
  }

  private async send<T>(label: string, action: () => Promise<T>): Promise<T> {
    return withRetry(action, 4, 750, (error) => {
      const transient = this.isTransient(error);
      if (transient) {
        console.warn(`[retry] ${label}: ${error instanceof Error ? error.message.split('\n')[0] : error}`);
      }
      return transient;
    });
  }

  private async read<T>(
    response: { ok: () => boolean; status: () => number; json: () => Promise<unknown>; text: () => Promise<string> },
    label: string,
  ): Promise<T> {
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`${label} failed (${response.status()}): ${body}`);
    }
    return (await response.json()) as T;
  }

  async login(email = config.customer.email, password = config.customer.password): Promise<LoginResult> {
    const response = await this.send('Login', () =>
      this.request.post(this.url('/users/login'), {
        data: { email, password },
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    return this.read<LoginResult>(response, 'Login');
  }

  async registerUniqueCustomer(): Promise<{ email: string; password: string; token: string }> {
    const stamp = `${Date.now()}.${Math.floor(Math.random() * 1_000_000)}`;
    const email = `qa.hybrid.${stamp}@example.com`;
    const password = `Hyb!${stamp}Qa#9`;
    const response = await this.send('Register user', () =>
      this.request.post(this.url('/users/register'), {
        headers: { 'Content-Type': 'application/json' },
        data: {
          first_name: 'Hybrid',
          last_name: 'Tester',
          email,
          password,
          dob: '1990-01-15',
          phone: '5550100123',
          address: {
            street: 'Test Street',
            house_number: '12',
            city: 'Utrecht',
            state: 'UT',
            country: 'NL',
            postal_code: '3511AB',
          },
        },
      }),
    );
    await this.read<Json>(response, 'Register user');
    const login = await this.login(email, password);
    return { email, password, token: login.access_token };
  }

  async listProducts(): Promise<Product[]> {
    const response = await this.send('List products', () => this.request.get(this.url('/products?page=1')));
    const body = await this.read<{ data: Product[] }>(response, 'List products');
    return body.data;
  }

  async firstInStockProduct(): Promise<Product> {
    const products = await this.listProducts();
    const product = products.find((item) => item.in_stock);
    if (!product) {
      throw new Error('No in-stock product found on GET /products');
    }
    return product;
  }

  async createCart(token?: string): Promise<string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await this.send('Create cart', () => this.request.post(this.url('/carts'), { headers, data: {} }));
    const body = await this.read<{ id: string }>(response, 'Create cart');
    return body.id;
  }

  async addToCart(cartId: string, productId: string, quantity = 1, token?: string): Promise<void> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    const response = await this.send('Add to cart', () =>
      this.request.post(this.url(`/carts/${cartId}`), {
        headers,
        data: { product_id: productId, quantity },
      }),
    );
    await this.read<Json>(response, 'Add to cart');
  }

  async seedLoggedInCart(): Promise<CartSeed> {
    // Always create a fresh user. The public demo customer is often locked (HTTP 423).
    const auth = await this.registerUniqueCustomer();
    const product = await this.firstInStockProduct();
    const cartId = await this.createCart(auth.token);
    const quantity = 1;
    await this.addToCart(cartId, product.id, quantity, auth.token);
    return { cartId, product, quantity, token: auth.token };
  }
}
