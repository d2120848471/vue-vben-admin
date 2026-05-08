/* eslint-disable vue/one-component-per-file */

import type { CustomerListItem } from '#/api/modules/admin/customers';

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ResetPasswordDialog from './ResetPasswordDialog.vue';

const apiMocks = vi.hoisted(() => ({
  resetCustomerPasswordApi: vi.fn(),
}));

vi.mock('#/api/modules/admin/customers', () => apiMocks);

vi.mock('element-plus', () => {
  const ElButton = defineComponent({
    name: 'ElButtonStub',
    emits: ['click'],
    setup(_, { attrs, emit, slots }) {
      return () =>
        h(
          'button',
          { ...attrs, onClick: (event: Event) => emit('click', event) },
          slots.default?.(),
        );
    },
  });
  const ElDialog = defineComponent({
    name: 'ElDialogStub',
    props: { modelValue: Boolean, title: { default: '', type: String } },
    setup(props, { slots }) {
      return () =>
        props.modelValue
          ? h('section', { 'data-test': 'dialog' }, [
              h('h2', props.title),
              slots.default?.(),
              slots.footer?.(),
            ])
          : null;
    },
  });
  const ElForm = defineComponent({
    name: 'ElFormStub',
    props: {
      model: { default: () => ({}), type: Object },
      rules: { default: () => ({}), type: Object },
    },
    setup(props, { expose, slots }) {
      expose({
        validate: vi.fn(async () => {
          const rules = props.rules as Record<string, any[]>;
          for (const [field, fieldRules] of Object.entries(rules)) {
            for (const rule of fieldRules ?? []) {
              if (typeof rule?.validator !== 'function') {
                continue;
              }
              const error = await new Promise<Error | undefined>((resolve) => {
                rule.validator({}, (props.model as any)[field], resolve);
              });
              if (error) {
                throw error;
              }
            }
          }
          return true;
        }),
      });
      return () => h('form', slots.default?.());
    },
  });
  const ElFormItem = defineComponent({
    name: 'ElFormItemStub',
    setup(_, { slots }) {
      return () => h('div', slots.default?.());
    },
  });
  const ElInput = defineComponent({
    name: 'ElInputStub',
    props: { modelValue: { default: '', type: String } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          value: props.modelValue,
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
        });
    },
  });
  return {
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElMessage: { success: vi.fn() },
  };
});

const customer: CustomerListItem = {
  company_name: '测试客户',
  created_at: '',
  id: 7,
  last_login_at: '',
  last_login_ip: '',
  phone: '13800000000',
  status: 1,
  updated_at: '',
};

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDialog() {
  const root = document.createElement('div');
  document.body.append(root);
  const visible = ref(true);
  const saved = vi.fn();
  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(ResetPasswordDialog, {
          customer,
          onSaved: saved,
          'onUpdate:visible': (value: boolean) => {
            visible.value = value;
          },
          visible: visible.value,
        });
    },
  });
  const app = createApp(Wrapper);
  app.mount(root);
  await nextTick();
  return {
    root,
    saved,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

function setInput(root: HTMLElement, testId: string, value: string) {
  const element = root.querySelector(`[data-test="${testId}"]`);
  expect(element).toBeTruthy();
  (element as HTMLInputElement).value = value;
  element?.dispatchEvent(new Event('input', { bubbles: true }));
}

function clickButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button).toBeTruthy();
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('ResetPasswordDialog', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.resetCustomerPasswordApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('resets login password and closes dialog', async () => {
    const view = await renderDialog();
    mounted.push(view);

    setInput(view.root, 'customer-reset-password', ' New_123 ');
    setInput(view.root, 'customer-reset-confirm-password', ' New_123 ');
    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.resetCustomerPasswordApi).toHaveBeenCalledWith(7, {
      confirm_password: 'New_123',
      password: 'New_123',
    });
    expect(view.saved).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(view.root.querySelector('[data-test="dialog"]')).toBeFalsy();
  });

  it('does not reset login password when confirmation mismatches', async () => {
    const view = await renderDialog();
    mounted.push(view);

    setInput(view.root, 'customer-reset-password', 'New_123');
    setInput(view.root, 'customer-reset-confirm-password', 'New_124');
    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.resetCustomerPasswordApi).not.toHaveBeenCalled();
    expect(view.saved).not.toHaveBeenCalled();
  });
});
