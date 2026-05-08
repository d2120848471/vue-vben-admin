/* eslint-disable vue/one-component-per-file */

import type { CustomerListItem } from '#/api/modules/admin/customers';

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import CustomerDialog from './CustomerDialog.vue';

const apiMocks = vi.hoisted(() => ({
  addCustomerApi: vi.fn(),
  updateCustomerApi: vi.fn(),
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

  const ElOption = defineComponent({
    name: 'ElOptionStub',
    props: { label: { default: '', type: String } },
    setup(props) {
      return () => h('option', props.label);
    },
  });

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: { modelValue: { default: 1, type: Number } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit, slots }) {
      return () =>
        h(
          'select',
          {
            ...attrs,
            value: String(props.modelValue),
            onChange: (event: Event) =>
              emit(
                'update:modelValue',
                Number((event.target as HTMLSelectElement).value),
              ),
          },
          slots.default?.(),
        );
    },
  });

  return {
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElMessage: { success: vi.fn() },
    ElOption,
    ElSelect,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDialog(
  options: {
    customer?: CustomerListItem | null;
    mode?: 'create' | 'edit';
    visible?: boolean;
  } = {},
) {
  const root = document.createElement('div');
  document.body.append(root);
  const visible = ref(options.visible ?? true);
  const saved = vi.fn();

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(CustomerDialog, {
          customer: options.customer ?? null,
          mode: options.mode ?? 'create',
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

function input(root: HTMLElement, testId: string) {
  const element = root.querySelector(`[data-test="${testId}"]`);
  expect(element).toBeTruthy();
  return element as HTMLInputElement;
}

function setInput(root: HTMLElement, testId: string, value: string) {
  const element = input(root, testId);
  element.value = value;
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

function setSelect(root: HTMLElement, testId: string, value: string) {
  const element = root.querySelector(`[data-test="${testId}"]`);
  expect(element).toBeTruthy();
  (element as HTMLSelectElement).value = value;
  element?.dispatchEvent(new Event('change', { bubbles: true }));
}

function clickButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button).toBeTruthy();
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('CustomerDialog', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.addCustomerApi.mockResolvedValue({ id: 7 });
    apiMocks.updateCustomerApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('creates customer with trimmed passwords', async () => {
    const view = await renderDialog();
    mounted.push(view);

    setInput(view.root, 'customer-company', ' 新增客户 ');
    setInput(view.root, 'customer-phone', ' 13800000000 ');
    setInput(view.root, 'customer-password', ' Abc_123 ');
    setInput(view.root, 'customer-confirm-password', ' Abc_123 ');
    setInput(view.root, 'customer-pay-password', ' 123456 ');
    setInput(view.root, 'customer-confirm-pay-password', ' 123456 ');

    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.addCustomerApi).toHaveBeenCalledWith({
      company_name: '新增客户',
      confirm_password: 'Abc_123',
      confirm_pay_password: '123456',
      password: 'Abc_123',
      pay_password: '123456',
      phone: '13800000000',
      status: 1,
    });
    expect(view.saved).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(view.root.querySelector('[data-test="dialog"]')).toBeFalsy();
  });

  it('does not create customer when confirmation passwords mismatch', async () => {
    const view = await renderDialog();
    mounted.push(view);

    setInput(view.root, 'customer-company', '新增客户');
    setInput(view.root, 'customer-phone', '13800000000');
    setInput(view.root, 'customer-password', 'Abc_123');
    setInput(view.root, 'customer-confirm-password', 'Abc_124');
    setInput(view.root, 'customer-pay-password', '123456');
    setInput(view.root, 'customer-confirm-pay-password', '654321');

    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.addCustomerApi).not.toHaveBeenCalled();
    expect(view.saved).not.toHaveBeenCalled();
  });

  it('updates customer without password fields', async () => {
    const view = await renderDialog({
      customer: {
        company_name: '旧客户',
        created_at: '',
        id: 7,
        last_login_at: '',
        last_login_ip: '',
        phone: '13800000000',
        status: 1,
        updated_at: '',
      },
      mode: 'edit',
    });
    mounted.push(view);

    expect(input(view.root, 'customer-company').value).toBe('旧客户');
    setInput(view.root, 'customer-company', ' 编辑客户 ');
    setInput(view.root, 'customer-phone', ' 13800000001 ');
    setSelect(view.root, 'customer-status', '0');

    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.updateCustomerApi).toHaveBeenCalledWith(7, {
      company_name: '编辑客户',
      phone: '13800000001',
      status: 0,
    });
    expect(view.saved).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(view.root.querySelector('[data-test="dialog"]')).toBeFalsy();
  });
});
