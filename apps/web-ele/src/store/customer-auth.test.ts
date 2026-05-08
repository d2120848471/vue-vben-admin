import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useCustomerAuthStore } from './customer-auth';

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
}));

const apiMocks = vi.hoisted(() => ({
  forgotCustomerPasswordApi: vi.fn(),
  loginCustomerApi: vi.fn(),
  registerCustomerApi: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => routerMock,
}));

vi.mock('#/api/modules/customer/auth', () => apiMocks);

describe('customer-auth store', () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  it('logs in and persists customer session separately from admin token', async () => {
    apiMocks.loginCustomerApi.mockResolvedValue({
      customer: {
        company_name: '测试公司',
        id: 9,
        phone: '13800000000',
        status: 1,
      },
      token: 'customer-token',
    });

    const store = useCustomerAuthStore();
    await store.login({
      password: 'Abc_123',
      phone: '13800000000',
    });

    expect(apiMocks.loginCustomerApi).toHaveBeenCalledWith({
      password: 'Abc_123',
      phone: '13800000000',
    });
    expect(store.token).toBe('customer-token');
    expect(store.customer?.company_name).toBe('测试公司');
    expect(localStorage.getItem('MYJOB_CUSTOMER_TOKEN')).toBe('customer-token');
    expect(routerMock.push).toHaveBeenCalledWith('/customer/home');
  });

  it('registers and persists customer session', async () => {
    apiMocks.registerCustomerApi.mockResolvedValue({
      customer: {
        company_name: '注册公司',
        id: 10,
        phone: '13800000001',
        status: 1,
      },
      token: 'register-token',
    });

    const store = useCustomerAuthStore();
    await store.register({
      company_name: '注册公司',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000001',
      sms_code: '123456',
    });

    expect(store.token).toBe('register-token');
    expect(store.customer?.phone).toBe('13800000001');
    expect(routerMock.push).toHaveBeenCalledWith('/customer/home');
  });

  it('clears old customer session after forgot password', async () => {
    localStorage.setItem('MYJOB_CUSTOMER_TOKEN', 'old-token');
    localStorage.setItem(
      'MYJOB_CUSTOMER_INFO',
      JSON.stringify({
        company_name: '旧客户',
        id: 1,
        phone: '13800000002',
        status: 1,
      }),
    );
    apiMocks.forgotCustomerPasswordApi.mockResolvedValue(undefined);

    const store = useCustomerAuthStore();
    expect(store.token).toBe('old-token');

    await store.forgotPassword({
      confirm_password: 'New_123',
      password: 'New_123',
      phone: '13800000002',
      sms_code: '123456',
    });

    expect(store.token).toBe('');
    expect(store.customer).toBeNull();
    expect(localStorage.getItem('MYJOB_CUSTOMER_TOKEN')).toBeNull();
    expect(routerMock.push).toHaveBeenCalledWith('/customer/auth/login');
  });

  it('logs out customer locally', async () => {
    localStorage.setItem('MYJOB_CUSTOMER_TOKEN', 'old-token');
    const store = useCustomerAuthStore();

    await store.logout();

    expect(store.token).toBe('');
    expect(store.customer).toBeNull();
    expect(routerMock.push).toHaveBeenCalledWith('/customer/auth/login');
  });

  it.each([
    ['invalid json', '{not-json'],
    ['empty object', '{}'],
    ['string payload', '"bad"'],
    ['null payload', 'null'],
  ])('clears token when stored customer payload is broken: %s', (_, raw) => {
    localStorage.setItem('MYJOB_CUSTOMER_TOKEN', 'broken-token');
    localStorage.setItem('MYJOB_CUSTOMER_INFO', raw);

    const store = useCustomerAuthStore();

    expect(store.token).toBe('');
    expect(store.customer).toBeNull();
    expect(localStorage.getItem('MYJOB_CUSTOMER_TOKEN')).toBeNull();
    expect(localStorage.getItem('MYJOB_CUSTOMER_INFO')).toBeNull();
  });
});
