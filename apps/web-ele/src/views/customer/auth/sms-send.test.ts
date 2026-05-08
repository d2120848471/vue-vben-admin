/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import ForgotPasswordPage from './forgot-password.vue';
import RegisterPage from './register.vue';

const formState = vi.hoisted(() => ({
  values: { phone: '' } as Record<string, any>,
}));

const apiMocks = vi.hoisted(() => ({
  sendCustomerSMSApi: vi.fn(),
}));

const messageMock = vi.hoisted(() => ({
  success: vi.fn(),
  warning: vi.fn(),
}));

vi.mock('#/api/modules/customer/auth', () => apiMocks);

vi.mock('#/store', () => ({
  useCustomerAuthStore: () => ({
    forgotPassword: vi.fn(),
    loading: false,
    register: vi.fn(),
  }),
}));

vi.mock('element-plus', () => ({
  ElButton: defineComponent({
    name: 'ElButtonStub',
    setup(_, { attrs, slots }) {
      return () => h('button', attrs, slots.default?.());
    },
  }),
  ElMessage: messageMock,
}));

function createAuthPageStub(name: string) {
  return defineComponent({
    name,
    props: {
      formSchema: { default: () => [], type: Array },
    },
    setup(props, { expose }) {
      expose({
        getFormApi: () => ({
          getValues: vi.fn().mockResolvedValue(formState.values),
        }),
      });

      return () =>
        h(
          'button',
          {
            'data-test': `send-${name}`,
            onClick: () => {
              const smsField = (props.formSchema as any[]).find(
                (item) => item.fieldName === 'sms_code',
              );
              const suffixNode = smsField?.suffix?.();
              return suffixNode?.props?.onClick?.();
            },
          },
          '发送验证码',
        );
    },
  });
}

vi.mock('@vben/common-ui', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@vben/common-ui')>();

  return {
    ...actual,
    AuthenticationForgetPassword: createAuthPageStub('forgot-password'),
    AuthenticationRegister: createAuthPageStub('register'),
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderPage(component: any) {
  const root = document.createElement('div');
  document.body.append(root);
  const app = createApp(component);
  app.mount(root);
  await nextTick();
  return {
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

describe('customer auth sms send', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.sendCustomerSMSApi.mockResolvedValue(undefined);
    formState.values = { phone: '23800000000' };
  });

  it('does not send register sms when phone format is invalid', async () => {
    const view = await renderPage(RegisterPage);

    view.root
      .querySelector('[data-test="send-register"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(apiMocks.sendCustomerSMSApi).not.toHaveBeenCalled();
    expect(messageMock.warning).toHaveBeenCalledWith(
      '请输入 1 开头的 11 位手机号',
    );

    view.unmount();
  });

  it('does not send forgot password sms when phone format is invalid', async () => {
    const view = await renderPage(ForgotPasswordPage);

    view.root
      .querySelector('[data-test="send-forgot-password"]')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await flushPromises();

    expect(apiMocks.sendCustomerSMSApi).not.toHaveBeenCalled();
    expect(messageMock.warning).toHaveBeenCalledWith(
      '请输入 1 开头的 11 位手机号',
    );

    view.unmount();
  });
});
