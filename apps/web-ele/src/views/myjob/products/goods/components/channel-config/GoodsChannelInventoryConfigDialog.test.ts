/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GoodsChannelInventoryConfigDialog from './GoodsChannelInventoryConfigDialog.vue';

const apiMocks = vi.hoisted(() => ({
  getProductGoodsInventoryConfigApi: vi.fn(),
  saveProductGoodsInventoryConfigApi: vi.fn(),
}));

const messageMocks = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));

const elementState = vi.hoisted(() => ({
  formItems: [] as Array<{ prop?: string; rules?: any }>,
}));

vi.mock('#/api/modules/admin/products/goods-inventory-config', () => apiMocks);

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
                (value === '' || value === null || value === undefined)
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
      disabled: Boolean,
      modelValue: {
        default: '',
        type: [Number, String],
      },
    },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          disabled: props.disabled,
          value: String(props.modelValue),
          onInput: (event: Event) =>
            emit('update:modelValue', (event.target as HTMLInputElement).value),
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

  const ElRadio = defineComponent({
    name: 'ElRadioStub',
    props: {
      label: {
        default: '',
        type: [Number, String],
      },
    },
    setup(props, { slots }) {
      return () =>
        h('span', { 'data-label': String(props.label) }, slots.default?.());
    },
  });

  const ElRadioGroup = defineComponent({
    name: 'ElRadioGroupStub',
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
            onInput: (event: Event) =>
              emit(
                'update:modelValue',
                /^\d+$/.test((event.target as HTMLInputElement).value)
                  ? Number((event.target as HTMLInputElement).value)
                  : (event.target as HTMLInputElement).value,
              ),
          }),
          slots.default?.(),
        ]);
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
            onInput: (event: Event) =>
              emit(
                'update:modelValue',
                (event.target as HTMLInputElement).value,
              ),
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
    ElMessage: messageMocks,
    ElOption,
    ElRadio,
    ElRadioGroup,
    ElSelect,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderDialog(initialVisible = true) {
  const root = document.createElement('div');
  document.body.append(root);

  const goodsIdRef = ref(21);
  const visibleRef = ref(initialVisible);
  const events = {
    saved: vi.fn(),
  };

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(GoodsChannelInventoryConfigDialog, {
          goodsId: goodsIdRef.value,
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
    setGoodsId(value: number) {
      goodsIdRef.value = value;
    },
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

describe('GoodsChannelInventoryConfigDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    elementState.formItems = [];
    messageMocks.error.mockReset();
    messageMocks.success.mockReset();
    apiMocks.getProductGoodsInventoryConfigApi.mockResolvedValue({
      config: {
        allow_loss_sale_enabled: 1,
        combo_goods_enabled: 0,
        max_loss_amount: '2.5000',
        order_strategy: 'weighted_percent',
        reorder_timeout_enabled: 1,
        reorder_timeout_minutes: 30,
        smart_reorder_enabled: 1,
        sync_cost_price_enabled: 1,
        sync_goods_name_enabled: 1,
      },
      goods: {
        brand_name: '腾讯视频',
        default_sell_price: '19.9000',
        goods_code: 'GD0000000021',
        has_tax: 1,
        id: 21,
        inventory_config_summary: {
          allow_loss_sale_enabled: 1,
          combo_goods_enabled: 0,
          max_loss_amount: '2.5000',
          order_strategy: 'weighted_percent',
          reorder_timeout_enabled: 1,
          reorder_timeout_minutes: 30,
          smart_reorder_enabled: 1,
          sync_cost_price_enabled: 1,
          sync_goods_name_enabled: 1,
        },
        name: '腾讯视频周卡',
        subject_id: 11,
        subject_name: '开票主体A',
      },
      order_strategy_options: [
        { label: '固定顺序', value: 'fixed_order' },
        { label: '百分比分配', value: 'weighted_percent' },
      ],
    });
    apiMocks.saveProductGoodsInventoryConfigApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('loads inventory config when opened and saves the edited payload', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductGoodsInventoryConfigApi).toHaveBeenCalledWith(21);
    expect(view.root.textContent).toContain('修改库存配置');

    findInput(view.root, 'input[data-test="inventory-order-strategy"]').value =
      'fixed_order';
    findInput(
      view.root,
      'input[data-test="inventory-order-strategy"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="inventory-timeout-minutes"]').value =
      '45';
    findInput(
      view.root,
      'input[data-test="inventory-timeout-minutes"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.saveProductGoodsInventoryConfigApi).toHaveBeenCalledWith(
      21,
      {
        allow_loss_sale_enabled: 1,
        combo_goods_enabled: 0,
        max_loss_amount: '2.5000',
        order_strategy: 'fixed_order',
        reorder_timeout_enabled: 1,
        reorder_timeout_minutes: 45,
        smart_reorder_enabled: 1,
        sync_cost_price_enabled: 1,
        sync_goods_name_enabled: 1,
      },
    );
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('normalizes timeout minutes and loss amount to zero when switches are disabled', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findInput(view.root, 'input[data-test="inventory-timeout-enabled"]').value =
      '0';
    findInput(
      view.root,
      'input[data-test="inventory-timeout-enabled"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="inventory-loss-enabled"]').value =
      '0';
    findInput(
      view.root,
      'input[data-test="inventory-loss-enabled"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.saveProductGoodsInventoryConfigApi).toHaveBeenCalledWith(
      21,
      expect.objectContaining({
        allow_loss_sale_enabled: 0,
        max_loss_amount: '0.0000',
        reorder_timeout_enabled: 0,
        reorder_timeout_minutes: 0,
      }),
    );
  });

  it('keeps the dialog open when save fails', async () => {
    apiMocks.saveProductGoodsInventoryConfigApi.mockRejectedValueOnce(
      new Error('save failed'),
    );

    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findButton(view.root, '确定').click();
    await flushPromises();
    await nextTick();

    expect(view.events.saved).not.toHaveBeenCalled();
    expect(messageMocks.error).toHaveBeenCalled();
    expect(view.root.querySelector('[data-test="dialog"]')).toBeTruthy();
  });

  it('clears stale config and blocks submit when reload fails', async () => {
    apiMocks.getProductGoodsInventoryConfigApi
      .mockResolvedValueOnce({
        config: {
          allow_loss_sale_enabled: 1,
          combo_goods_enabled: 0,
          max_loss_amount: '2.5000',
          order_strategy: 'weighted_percent',
          reorder_timeout_enabled: 1,
          reorder_timeout_minutes: 30,
          smart_reorder_enabled: 1,
          sync_cost_price_enabled: 1,
          sync_goods_name_enabled: 1,
        },
        goods: {
          brand_name: '腾讯视频',
          default_sell_price: '19.9000',
          goods_code: 'GD0000000021',
          has_tax: 1,
          id: 21,
          inventory_config_summary: undefined,
          name: '腾讯视频周卡',
          subject_id: 11,
          subject_name: '开票主体A',
        },
        order_strategy_options: [
          { label: '百分比分配', value: 'weighted_percent' },
        ],
      })
      .mockRejectedValueOnce(new Error('load failed'));

    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(
      findInput(view.root, 'input[data-test="inventory-order-strategy"]').value,
    ).toBe('weighted_percent');

    view.setGoodsId(22);
    await flushPromises();
    await nextTick();

    expect(messageMocks.error).toHaveBeenCalledWith(
      '库存配置加载失败，请稍后重试',
    );
    expect(view.root.textContent).toContain('库存配置加载失败，请稍后重试');

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.saveProductGoodsInventoryConfigApi).not.toHaveBeenCalled();
  });

  it('does not submit when timeout minutes format is invalid', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findInput(view.root, 'input[data-test="inventory-timeout-minutes"]').value =
      'abc';
    findInput(
      view.root,
      'input[data-test="inventory-timeout-minutes"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.saveProductGoodsInventoryConfigApi).not.toHaveBeenCalled();
  });

  it('does not submit when max loss amount format is invalid', async () => {
    const view = await renderDialog();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    findInput(view.root, 'input[data-test="inventory-max-loss-amount"]').value =
      '-1';
    findInput(
      view.root,
      'input[data-test="inventory-max-loss-amount"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.saveProductGoodsInventoryConfigApi).not.toHaveBeenCalled();
  });
});
