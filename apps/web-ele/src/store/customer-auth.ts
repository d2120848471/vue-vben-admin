import type {
  CustomerAuthResult,
  CustomerAuthUser,
  CustomerForgotPasswordPayload,
  CustomerLoginPayload,
  CustomerRegisterPayload,
} from '#/api/modules/customer/auth';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { defineStore } from 'pinia';

import {
  forgotCustomerPasswordApi,
  loginCustomerApi,
  registerCustomerApi,
} from '#/api/modules/customer/auth';
import {
  CUSTOMER_INFO_STORAGE_KEY,
  CUSTOMER_TOKEN_STORAGE_KEY,
} from '#/views/customer/auth/constants';

function isCustomerAuthUser(value: unknown): value is CustomerAuthUser {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const customer = value as Partial<CustomerAuthUser>;
  return (
    Number.isInteger(customer.id) &&
    typeof customer.company_name === 'string' &&
    customer.company_name.trim().length > 0 &&
    /^1\d{10}$/.test(String(customer.phone ?? '').trim()) &&
    (customer.status === 0 || customer.status === 1)
  );
}

function readStoredCustomer() {
  const rawValue = localStorage.getItem(CUSTOMER_INFO_STORAGE_KEY);
  if (!rawValue) {
    localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
    return null;
  }
  try {
    const customer = JSON.parse(rawValue) as unknown;
    if (!isCustomerAuthUser(customer)) {
      clearStoredCustomerSession();
      return null;
    }
    return customer;
  } catch {
    clearStoredCustomerSession();
    return null;
  }
}

function persistCustomerSession(result: CustomerAuthResult) {
  localStorage.setItem(CUSTOMER_TOKEN_STORAGE_KEY, result.token);
  localStorage.setItem(
    CUSTOMER_INFO_STORAGE_KEY,
    JSON.stringify(result.customer),
  );
}

function clearStoredCustomerSession() {
  localStorage.removeItem(CUSTOMER_TOKEN_STORAGE_KEY);
  localStorage.removeItem(CUSTOMER_INFO_STORAGE_KEY);
}

/**
 * 客户侧登录态必须独立于后台 accessStore，避免客户 token 污染后台权限体系。
 */
export const useCustomerAuthStore = defineStore('customer-auth', () => {
  const router = useRouter();
  const customer = ref<CustomerAuthUser | null>(readStoredCustomer());
  const token = ref(
    customer.value
      ? (localStorage.getItem(CUSTOMER_TOKEN_STORAGE_KEY) ?? '')
      : '',
  );
  const loading = ref(false);
  const isLoggedIn = computed(() => !!token.value);

  async function applySession(result: CustomerAuthResult) {
    token.value = result.token;
    customer.value = result.customer;
    persistCustomerSession(result);
    await router.push('/customer/home');
  }

  function clearSession() {
    token.value = '';
    customer.value = null;
    clearStoredCustomerSession();
  }

  async function login(payload: CustomerLoginPayload) {
    try {
      loading.value = true;
      await applySession(await loginCustomerApi(payload));
    } finally {
      loading.value = false;
    }
  }

  async function register(payload: CustomerRegisterPayload) {
    try {
      loading.value = true;
      await applySession(await registerCustomerApi(payload));
    } finally {
      loading.value = false;
    }
  }

  async function forgotPassword(payload: CustomerForgotPasswordPayload) {
    try {
      loading.value = true;
      await forgotCustomerPasswordApi(payload);
      // 找回密码会使旧客户 token 失效，前端必须同步清理本地客户登录态。
      clearSession();
      await router.push('/customer/auth/login');
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    clearSession();
    await router.push('/customer/auth/login');
  }

  return {
    clearSession,
    customer,
    forgotPassword,
    isLoggedIn,
    loading,
    login,
    logout,
    register,
    token,
  };
});
