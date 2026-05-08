import { beforeEach, describe, expect, it, vi } from 'vitest';

const accessStoreMock = vi.hoisted(() => ({
  accessToken: 'admin-token',
  isAccessChecked: true,
  setAccessToken: vi.fn(),
  setLoginExpired: vi.fn(),
}));

const authStoreMock = vi.hoisted(() => ({
  logout: vi.fn(),
}));

const messageMock = vi.hoisted(() => ({
  error: vi.fn(),
}));

const storeMocks = vi.hoisted(() => ({
  useAccessStore: vi.fn(() => accessStoreMock),
}));

vi.mock('@vben/hooks', () => ({
  useAppConfig: () => ({ apiURL: '/api' }),
}));

vi.mock('@vben/preferences', () => ({
  preferences: {
    app: {
      locale: 'zh-CN',
      loginExpiredMode: 'page',
    },
  },
}));

vi.mock('@vben/stores', () => ({
  useAccessStore: storeMocks.useAccessStore,
}));

vi.mock('element-plus', () => ({
  ElMessage: messageMock,
}));

vi.mock('#/router', () => ({
  router: {
    currentRoute: { value: { path: '/' } },
    replace: vi.fn(),
  },
}));

vi.mock('#/store', () => ({
  useAuthStore: () => authStoreMock,
}));

describe('customer auth request client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function getHeader(config: Record<string, any>, name: string) {
    const headers = config.headers as any;
    return (
      headers?.get?.(name) ?? headers?.[name] ?? headers?.[name.toLowerCase()]
    );
  }

  async function requestWithResponse(response: {
    data: unknown;
    status: number;
  }) {
    const { customerAuthRequestClient } = await import('#/api/request');
    let capturedConfig: Record<string, any> | undefined;

    customerAuthRequestClient.instance.defaults.adapter = async (config) => {
      capturedConfig = config;
      return {
        config,
        data: response.data,
        headers: {},
        status: response.status,
        statusText: response.status === 200 ? 'OK' : 'Unauthorized',
      };
    };

    const promise = customerAuthRequestClient.post('/customer/auth/login', {
      password: 'Abc_123',
      phone: '13800000000',
    });

    return { capturedConfig: () => capturedConfig, promise };
  }

  it('does not attach admin authorization and unwraps successful response', async () => {
    const { capturedConfig, promise } = await requestWithResponse({
      data: {
        code: 0,
        data: { token: 'customer-token' },
        message: '',
      },
      status: 200,
    });

    await expect(promise).resolves.toEqual({ token: 'customer-token' });
    const config = capturedConfig();
    expect(config).toBeDefined();
    expect(getHeader(config ?? {}, 'Authorization')).toBeUndefined();
    expect(getHeader(config ?? {}, 'Accept-Language')).toBe('zh-CN');
    expect(storeMocks.useAccessStore).not.toHaveBeenCalled();
  });

  it('shows backend message for business errors', async () => {
    const { promise } = await requestWithResponse({
      data: {
        code: 1001,
        data: null,
        message: '手机号已注册',
      },
      status: 200,
    });

    await expect(promise).rejects.toMatchObject({
      code: 1001,
      message: '手机号已注册',
    });
    expect(messageMock.error).toHaveBeenCalledWith('手机号已注册');
  });

  it('does not trigger admin logout for customer 401 responses', async () => {
    const { promise } = await requestWithResponse({
      data: {
        code: 401,
        data: null,
        message: '客户未登录',
      },
      status: 401,
    });

    await expect(promise).rejects.toMatchObject({
      code: 401,
      message: '客户未登录',
    });
    expect(authStoreMock.logout).not.toHaveBeenCalled();
    expect(accessStoreMock.setAccessToken).not.toHaveBeenCalled();
    expect(messageMock.error).toHaveBeenCalledWith('客户未登录');
  });
});
