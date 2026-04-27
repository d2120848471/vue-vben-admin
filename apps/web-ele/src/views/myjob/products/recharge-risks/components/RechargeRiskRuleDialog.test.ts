/* eslint-disable vue/one-component-per-file */

import type { RechargeRiskRuleListItem } from '#/api/modules/admin/products/recharge-risks';

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import RechargeRiskRuleDialog from './RechargeRiskRuleDialog.vue';

const apiMocks = vi.hoisted(() => ({
  addRechargeRiskRuleApi: vi.fn(),
  updateRechargeRiskRuleApi: vi.fn(),
}));

vi.mock('#/api/modules/admin/products/recharge-risks', () => apiMocks);

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
    setup(_, { expose, slots }) {
      expose({ validate: vi.fn().mockResolvedValue(true) });
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
    editingRule?: RechargeRiskRuleListItem;
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
        h(RechargeRiskRuleDialog, {
          editingRule: options.editingRule ?? null,
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

function clickButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button).toBeTruthy();
  button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
}

describe('RechargeRiskRuleDialog', () => {
  const mounted: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.addRechargeRiskRuleApi.mockResolvedValue({ id: 41 });
    apiMocks.updateRechargeRiskRuleApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mounted.length > 0) {
      mounted.pop()?.unmount();
    }
  });

  it('creates enabled rule by default with trimmed payload', async () => {
    const view = await renderDialog();
    mounted.push(view);

    input(view.root, 'risk-account').value = ' risk-account-001 ';
    input(view.root, 'risk-account').dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    input(view.root, 'risk-keyword').value = ' 剪映 ';
    input(view.root, 'risk-keyword').dispatchEvent(
      new Event('input', { bubbles: true }),
    );
    input(view.root, 'risk-reason').value = ' 错误账号 ';
    input(view.root, 'risk-reason').dispatchEvent(
      new Event('input', { bubbles: true }),
    );

    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.addRechargeRiskRuleApi).toHaveBeenCalledWith({
      account: 'risk-account-001',
      goods_keyword: '剪映',
      reason: '错误账号',
      status: 1,
    });
    expect(view.saved).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(view.root.querySelector('[data-test="dialog"]')).toBeFalsy();
  });

  it('updates editing rule with row values', async () => {
    const view = await renderDialog({
      editingRule: {
        account: 'old-account',
        created_at: '2026-04-27 10:00:00',
        created_by_name: 'admin',
        goods_keyword: '微博',
        hit_count: 1,
        id: 42,
        reason: '旧原因',
        status: 0,
        status_text: '停用',
        updated_at: '2026-04-27 11:00:00',
        updated_by_name: 'admin',
      },
    });
    mounted.push(view);

    expect(input(view.root, 'risk-account').value).toBe('old-account');
    input(view.root, 'risk-reason').value = ' 新原因 ';
    input(view.root, 'risk-reason').dispatchEvent(
      new Event('input', { bubbles: true }),
    );

    clickButton(view.root, '保存');
    await flushPromises();

    expect(apiMocks.updateRechargeRiskRuleApi).toHaveBeenCalledWith(42, {
      account: 'old-account',
      goods_keyword: '微博',
      reason: '新原因',
      status: 0,
    });
    expect(view.saved).toHaveBeenCalledTimes(1);
    await nextTick();
    expect(view.root.querySelector('[data-test="dialog"]')).toBeFalsy();
  });
});
