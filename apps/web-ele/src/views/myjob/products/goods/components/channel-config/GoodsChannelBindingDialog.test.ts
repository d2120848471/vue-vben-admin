/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GoodsChannelBindingDialog from './GoodsChannelBindingDialog.vue';

const apiMocks = vi.hoisted(() => ({
  createProductGoodsChannelBindingApi: vi.fn(),
  updateProductGoodsChannelBindingApi: vi.fn(),
}));

const elementState = vi.hoisted(() => ({
  formItems: [] as Array<{ prop?: string; rules?: any }>,
}));

vi.mock('#/api/modules/admin/products/goods-channels', () => apiMocks);

vi.mock('element-plus', () => {
  const ElButton = defineComponent({
    name: 'ElButtonStub',
    emits: ['click'],
    setup(_, { attrs, emit, slots }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            onClick: (event: Event) => emit('click', event),
          },
          slots.default?.(),
        );
    },
  });

  const ElDialog = defineComponent({
    name: 'ElDialogStub',
    props: { modelValue: Boolean, title: { default: '', type: String } },
    emits: ['update:modelValue'],
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
      model: {
        default: () => ({}),
        type: Object,
      },
    },
    setup(props, { expose, slots }) {
      expose({
        validate: vi.fn().mockImplementation(async () => {
          for (const item of elementState.formItems) {
            if (!item.prop || !item.rules) {
              continue;
            }
            const rules = Array.isArray(item.rules) ? item.rules : [item.rules];
            const value = (props.model as Record<string, any>)[item.prop];
            for (const rule of rules) {
              if (
                rule.required &&
                (value === '' ||
                  value === null ||
                  value === undefined ||
                  (Array.isArray(value) && value.length === 0))
              ) {
                throw new Error(rule.message ?? 'required');
              }
              if (typeof rule.validator === 'function') {
                await new Promise<void>((resolve, reject) => {
                  const callback = (error?: Error | string) => {
                    if (error) {
                      reject(error);
                    } else {
                      resolve();
                    }
                  };
                  const result = rule.validator(rule, value, callback);
                  if (result && typeof result.then === 'function') {
                    result.then(() => resolve()).catch(reject);
                  }
                });
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
    props: {
      prop: {
        default: '',
        type: String,
      },
      rules: {
        default: undefined,
        type: [Array, Object],
      },
    },
    setup(props, { slots }) {
      elementState.formItems.push(props);
      return () => h('div', slots.default?.());
    },
  });

  const ElInput = defineComponent({
    name: 'ElInputStub',
    props: {
      modelValue: {
        default: '',
        type: String,
      },
    },
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

  const ElInputNumber = defineComponent({
    name: 'ElInputNumberStub',
    props: {
      modelValue: {
        default: 0,
        type: Number,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          value: String(props.modelValue),
          onInput: (event: Event) =>
            emit(
              'update:modelValue',
              Number((event.target as HTMLInputElement).value),
            ),
        });
    },
  });

  const ElOption = defineComponent({
    name: 'ElOptionStub',
    props: {
      label: {
        default: '',
        type: String,
      },
    },
    setup(props) {
      return () => h('div', props.label);
    },
  });

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: {
      modelValue: {
        default: '',
        type: [Number, String],
      },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit, slots }) {
      return () =>
        h('div', [
          h('input', {
            ...attrs,
            value: String(props.modelValue),
            onInput: (event: Event) => {
              const rawValue = (event.target as HTMLInputElement).value;
              emit(
                'update:modelValue',
                typeof props.modelValue === 'number'
                  ? Number(rawValue)
                  : rawValue,
              );
            },
          }),
          slots.default?.(),
        ]);
    },
  });

  return {
    ElButton,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElInputNumber,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
    },
    ElOption,
    ElSelect,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDialog(editingBinding: any = null, visible = true) {
  const root = document.createElement('div');
  document.body.append(root);

  const visibleRef = ref(visible);
  const editingBindingRef = ref(editingBinding);
  const events = {
    saved: vi.fn(),
  };

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(GoodsChannelBindingDialog, {
          dockStatusOptions: [
            { label: '正常', value: 1 },
            { label: '关闭', value: 0 },
          ],
          editingBinding: editingBindingRef.value,
          goodsId: 21,
          platformAccounts: [
            {
              connect_status: 1,
              connect_status_text: '正常',
              has_tax: 1,
              id: 101,
              name: '渠道A',
              subject_id: 11,
              subject_name: '开票主体A',
            },
            {
              connect_status: 1,
              connect_status_text: '正常',
              has_tax: 0,
              id: 102,
              name: '渠道B',
              subject_id: 11,
              subject_name: '开票主体A',
            },
          ],
          validateTemplates: [{ id: 7, title: '模板A' }],
          visible: visibleRef.value,
          'onUpdate:visible': (value: boolean) => {
            visibleRef.value = value;
          },
          onSaved: events.saved,
        });
    },
  });

  const app = createApp(Wrapper);
  app.mount(root);
  await nextTick();

  return {
    events,
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
  };
}

function findInput(root: HTMLElement, selector: string) {
  const target = root.querySelector(selector);
  expect(target).toBeTruthy();
  return target as HTMLInputElement;
}

function findButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button).toBeTruthy();
  return button as HTMLButtonElement;
}

describe('GoodsChannelBindingDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    elementState.formItems = [];
    apiMocks.createProductGoodsChannelBindingApi.mockResolvedValue({ id: 31 });
    apiMocks.updateProductGoodsChannelBindingApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('creates a channel binding with normalized payload', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    findInput(view.root, 'input[data-test="channel-platform-account"]').value =
      '101';
    findInput(
      view.root,
      'input[data-test="channel-platform-account"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-supplier-goods-no"]').value =
      ' SKU-001 ';
    findInput(
      view.root,
      'input[data-test="channel-supplier-goods-no"]',
    ).dispatchEvent(new Event('input'));
    findInput(
      view.root,
      'input[data-test="channel-supplier-goods-name"]',
    ).value = ' 腾讯周卡 ';
    findInput(
      view.root,
      'input[data-test="channel-supplier-goods-name"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-source-cost-price"]').value =
      ' 10.5000 ';
    findInput(
      view.root,
      'input[data-test="channel-source-cost-price"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-validate-template"]').value =
      '7';
    findInput(
      view.root,
      'input[data-test="channel-validate-template"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-dock-status"]').value = '1';
    findInput(
      view.root,
      'input[data-test="channel-dock-status"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-sort"]').value = '20';
    findInput(view.root, 'input[data-test="channel-sort"]').dispatchEvent(
      new Event('input'),
    );

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.createProductGoodsChannelBindingApi).toHaveBeenCalledWith(
      21,
      {
        dock_status: 1,
        platform_account_id: 101,
        sort: 20,
        source_cost_price: '10.5000',
        supplier_goods_name: '腾讯周卡',
        supplier_goods_no: 'SKU-001',
        validate_template_id: 7,
      },
    );
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('renders editing values and updates the existing binding', async () => {
    const view = await renderDialog({
      dock_status: 0,
      id: 31,
      platform_account_id: 102,
      sort: 30,
      source_cost_price: '11.0000',
      supplier_goods_name: '腾讯周卡-旧',
      supplier_goods_no: 'SKU-002',
      validate_template_id: 7,
    });
    mountedRoots.push(view);

    expect(
      findInput(view.root, 'input[data-test="channel-supplier-goods-no"]')
        .value,
    ).toBe('SKU-002');
    expect(
      findInput(view.root, 'input[data-test="channel-supplier-goods-name"]')
        .value,
    ).toBe('腾讯周卡-旧');

    findInput(view.root, 'input[data-test="channel-sort"]').value = '5';
    findInput(view.root, 'input[data-test="channel-sort"]').dispatchEvent(
      new Event('input'),
    );

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.updateProductGoodsChannelBindingApi).toHaveBeenCalledWith(
      21,
      31,
      {
        dock_status: 0,
        platform_account_id: 102,
        sort: 5,
        source_cost_price: '11.0000',
        supplier_goods_name: '腾讯周卡-旧',
        supplier_goods_no: 'SKU-002',
        validate_template_id: 7,
      },
    );
  });

  it('does not submit when required fields are blank', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.createProductGoodsChannelBindingApi).not.toHaveBeenCalled();
  });

  it('does not submit when platform account remains zero', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    findInput(view.root, 'input[data-test="channel-supplier-goods-no"]').value =
      'SKU-003';
    findInput(
      view.root,
      'input[data-test="channel-supplier-goods-no"]',
    ).dispatchEvent(new Event('input'));
    findInput(
      view.root,
      'input[data-test="channel-supplier-goods-name"]',
    ).value = '腾讯周卡';
    findInput(
      view.root,
      'input[data-test="channel-supplier-goods-name"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="channel-source-cost-price"]').value =
      '10.0000';
    findInput(
      view.root,
      'input[data-test="channel-source-cost-price"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.createProductGoodsChannelBindingApi).not.toHaveBeenCalled();
  });
});
