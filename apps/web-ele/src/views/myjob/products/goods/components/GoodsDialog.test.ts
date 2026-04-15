/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick, ref } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GoodsDialog from './GoodsDialog.vue';

const apiMocks = vi.hoisted(() => ({
  addProductGoodsApi: vi.fn(),
  getProductGoodsDetailApi: vi.fn(),
  getSubjectsApi: vi.fn(),
  updateProductGoodsApi: vi.fn(),
}));

vi.mock('#/api', () => apiMocks);

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

  const ElCascader = defineComponent({
    name: 'ElCascaderStub',
    props: { modelValue: { default: () => [], type: Array } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          value: props.modelValue.join(','),
          onInput: (event: Event) =>
            emit(
              'update:modelValue',
              String((event.target as HTMLInputElement).value)
                .split(',')
                .filter(Boolean)
                .map(Number),
            ),
        });
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

  const ElInputNumber = defineComponent({
    name: 'ElInputNumberStub',
    props: { modelValue: { default: 0, type: Number } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h('input', {
          ...attrs,
          type: 'number',
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
    props: { label: { default: '', type: String } },
    setup(props) {
      return () => h('div', props.label);
    },
  });

  const ElSelect = defineComponent({
    name: 'ElSelectStub',
    props: { modelValue: { default: '', type: [Array, Number, String] } },
    emits: ['update:modelValue'],
    setup(props, { attrs, emit, slots }) {
      return () =>
        h('div', [
          h('input', {
            ...attrs,
            value: Array.isArray(props.modelValue)
              ? props.modelValue.join(',')
              : String(props.modelValue),
            onInput: (event: Event) => {
              const nextValue = (event.target as HTMLInputElement).value;
              if (Array.isArray(props.modelValue)) {
                emit(
                  'update:modelValue',
                  nextValue
                    .split(',')
                    .filter(Boolean)
                    .map(Number),
                );
                return;
              }
              if (typeof props.modelValue === 'number') {
                emit('update:modelValue', Number(nextValue));
                return;
              }
              emit('update:modelValue', nextValue);
            },
          }),
          slots.default?.(),
        ]);
    },
  });

  return {
    ElButton,
    ElCascader,
    ElDialog,
    ElForm,
    ElFormItem,
    ElInput,
    ElInputNumber,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
    ElOption,
    ElSelect,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function createDeferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, reject, resolve };
}

async function renderDialog(
  initialEditingGoods: any = null,
  initialVisible = false,
) {
  const root = document.createElement('div');
  document.body.append(root);

  const visible = ref(initialVisible);
  const editingGoods = ref(initialEditingGoods);
  const events = {
    saved: vi.fn(),
  };

  const Wrapper = defineComponent({
    setup() {
      return () =>
        h(GoodsDialog, {
          booleanOptions: [
            { label: '是', value: 1 },
            { label: '否', value: 0 },
          ],
          brandCascaderOptions: [
            {
              children: [
                {
                  children: [],
                  disabled: false,
                  label: '腾讯视频月卡',
                  value: 11,
                },
              ],
              disabled: false,
              label: '腾讯视频',
              value: 1,
            },
          ],
          brandTreeOptions: [
            {
              children: [
                { children: [], id: 11, is_leaf: true, name: '腾讯视频月卡' },
              ],
              id: 1,
              is_leaf: false,
              name: '腾讯视频',
            },
          ],
          editingGoods: editingGoods.value,
          goodsTypeOptions: [{ label: '卡密', value: 'card_secret' }],
          statusOptions: [
            { label: '启用', value: 1 },
            { label: '停用', value: 0 },
          ],
          strategyOptions: [{ id: 9, name: '限购策略' }],
          supplyTypeOptions: [{ label: '渠道', value: 'channel' }],
          templateOptions: [{ id: 3, title: '模板A' }],
          visible: visible.value,
          'onUpdate:visible': (value: boolean) => {
            visible.value = value;
          },
          onSaved: events.saved,
        });
    },
  });

  const app = createApp(Wrapper);
  app.config.errorHandler = () => {};
  app.mount(root);
  await nextTick();

  return {
    editingGoods,
    events,
    root,
    unmount() {
      app.unmount();
      root.remove();
    },
    visible,
  };
}

function findInput(root: HTMLElement, selector: string) {
  const input = root.querySelector(selector);
  expect(input).toBeTruthy();
  return input as HTMLInputElement;
}

describe('GoodsDialog', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    apiMocks.getSubjectsApi.mockResolvedValue({
      list: [{ has_tax: 1, id: 7, name: '聚权益' }],
    });
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('loads subject options only when the dialog opens and submits create payload', async () => {
    const view = await renderDialog(null, false);
    mountedRoots.push(view);

    expect(apiMocks.getSubjectsApi).not.toHaveBeenCalled();

    view.visible.value = true;
    await flushPromises();
    await nextTick();

    expect(apiMocks.getSubjectsApi).toHaveBeenCalledTimes(1);

    const brandPath = findInput(
      view.root,
      'input[data-test="goods-brand-path"]',
    );
    brandPath.value = '1,11';
    brandPath.dispatchEvent(new Event('input'));

    const goodsName = findInput(view.root, 'input[data-test="goods-name"]');
    goodsName.value = '新商品';
    goodsName.dispatchEvent(new Event('input'));

    view.root.querySelectorAll('button').forEach((button) => {
      if (button.textContent?.trim() === '确定') {
        button.click();
      }
    });
    await flushPromises();

    expect(apiMocks.addProductGoodsApi).toHaveBeenCalledWith({
      balance_limit: '0.0000',
      brand_id: 11,
      default_sell_price: '',
      exception_notify: 1,
      goods_type: 'card_secret',
      has_tax: 0,
      is_douyin: 0,
      is_export: 1,
      max_purchase_qty: 1,
      min_purchase_qty: 1,
      name: '新商品',
      product_template_id: null,
      purchase_limit_strategy_id: null,
      purchase_notice: '',
      status: 1,
      subject_id: null,
      supply_type: 'channel',
      terminal_price_limit: '',
    });
    expect(view.events.saved).toHaveBeenCalledTimes(1);
  });

  it('backfills edit detail and clears subject when tax flag switches off', async () => {
    apiMocks.getProductGoodsDetailApi.mockResolvedValue({
      balance_limit: '10.0000',
      brand_id: 11,
      default_sell_price: '20.0000',
      exception_notify: 1,
      goods_code: 'GD001',
      goods_type: 'card_secret',
      has_tax: 1,
      is_douyin: 0,
      is_export: 1,
      max_purchase_qty: 5,
      min_purchase_qty: 1,
      name: '原商品',
      product_template_id: 3,
      purchase_limit_strategy_id: 9,
      purchase_limit_strategy_name: '限购策略',
      purchase_limit_strategy_status: 1,
      purchase_notice: '须知',
      status: 1,
      subject_id: 7,
      supply_type: 'channel',
      terminal_price_limit: '30.0000',
    });

    const view = await renderDialog({ id: 9, name: '原商品' }, true);
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductGoodsDetailApi).toHaveBeenCalledWith(9);
    expect(findInput(view.root, 'input[data-test="goods-code"]').value).toBe(
      'GD001',
    );

    const hasTaxInput = findInput(
      view.root,
      'input[data-test="goods-has-tax"]',
    );
    hasTaxInput.value = '0';
    hasTaxInput.dispatchEvent(new Event('input'));
    await nextTick();

    view.root.querySelectorAll('button').forEach((button) => {
      if (button.textContent?.trim() === '确定') {
        button.click();
      }
    });
    await flushPromises();

    expect(apiMocks.updateProductGoodsApi).toHaveBeenCalledWith(
      9,
      expect.objectContaining({
        subject_id: null,
      }),
    );
  });

  it('keeps submit disabled until edit detail finishes loading', async () => {
    const detailDeferred = createDeferred<any>();
    apiMocks.getProductGoodsDetailApi.mockReturnValue(detailDeferred.promise);

    const view = await renderDialog({ id: 9, name: '原商品' }, true);
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const confirmButton = [...view.root.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === '确定',
    ) as HTMLButtonElement | undefined;
    expect(confirmButton).toBeTruthy();
    expect(confirmButton?.disabled).toBe(true);

    confirmButton?.click();
    await flushPromises();

    expect(apiMocks.updateProductGoodsApi).not.toHaveBeenCalled();

    detailDeferred.resolve({
      balance_limit: '10.0000',
      brand_id: 11,
      default_sell_price: '20.0000',
      exception_notify: 1,
      goods_code: 'GD001',
      goods_type: 'card_secret',
      has_tax: 1,
      is_douyin: 0,
      is_export: 1,
      max_purchase_qty: 5,
      min_purchase_qty: 1,
      name: '原商品',
      product_template_id: 3,
      purchase_limit_strategy_id: 9,
      purchase_limit_strategy_name: '限购策略',
      purchase_limit_strategy_status: 1,
      purchase_notice: '须知',
      status: 1,
      subject_id: 7,
      supply_type: 'channel',
      terminal_price_limit: '30.0000',
    });
    await flushPromises();
    await nextTick();

    expect(findInput(view.root, 'input[data-test="goods-code"]').value).toBe(
      'GD001',
    );
    expect(
      (
        [...view.root.querySelectorAll('button')].find(
          (button) => button.textContent?.trim() === '确定',
        ) as HTMLButtonElement | undefined
      )?.disabled,
    ).toBe(false);
  });
});
