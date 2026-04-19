/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import GoodsPage from './index.vue';

const fixtures = vi.hoisted(() => ({
  detail: {
    balance_limit: '0.0000',
    brand_id: 3,
    brand_name: '腾讯视频周卡',
    created_at: '2026-04-14 20:00:00',
    default_sell_price: '19.9000',
    exception_notify: 1,
    goods_code: 'GD0000000001',
    goods_type: 'card_secret',
    has_tax: 1,
    id: 1,
    is_douyin: 0,
    is_export: 1,
    max_purchase_qty: 5,
    min_purchase_qty: 1,
    name: '腾讯视频周卡商品',
    product_template_id: 7,
    product_template_title: '腾讯模板',
    purchase_limit_strategy_id: 9,
    purchase_limit_strategy_name: '旧策略',
    purchase_limit_strategy_status: 0,
    purchase_notice: '购买须知',
    status: 1,
    subject_id: 11,
    subject_name: '开票主体A',
    supply_type: 'channel',
    terminal_price_limit: '29.9000',
    updated_at: '2026-04-14 21:00:00',
  },
  formOptions: {
    boolean_options: [
      { label: '是', value: 1 },
      { label: '否', value: 0 },
    ],
    brands: [
      {
        children: [
          {
            children: [{ children: [], id: 3, is_leaf: true, name: '周卡' }],
            id: 2,
            is_leaf: false,
            name: 'SVIP',
          },
        ],
        id: 1,
        is_leaf: false,
        name: '腾讯视频',
      },
    ],
    goods_types: [
      { label: '卡密', value: 'card_secret' },
      { label: '直充', value: 'direct_recharge' },
    ],
    purchase_limit_strategies: [{ id: 8, name: '启用策略' }],
    status_options: [
      { label: '启用', value: 1 },
      { label: '停用', value: 0 },
    ],
    subjects: [{ has_tax: 1, id: 99, name: '聚合接口旧主体' }],
    supply_types: [{ label: '渠道供货', value: 'channel' }],
    templates: [{ id: 7, title: '腾讯模板' }],
  },
  subjects: [
    {
      created_at: '2026-04-14 20:00:00',
      has_tax: 1,
      id: 11,
      name: '开票主体A',
      updated_at: '2026-04-14 21:00:00',
    },
    {
      created_at: '2026-04-14 20:00:00',
      has_tax: 0,
      id: 12,
      name: '未税主体B',
      updated_at: '2026-04-14 21:00:00',
    },
  ],
  rows: [
    {
      brand_id: 3,
      brand_icon: '/uploads/brands/tencent.png',
      brand_name: '腾讯视频周卡',
      bound_channel_count: 0,
      bound_channels: [],
      channel_auto_price_status: 0,
      created_at: '2026-04-14 20:00:00',
      default_sell_price: '19.9000',
      exception_notify: 1,
      goods_code: 'GD0000000001',
      goods_type: 'card_secret',
      has_tax: 1,
      id: 1,
      is_douyin: 0,
      is_export: 1,
      min_channel_cost: '',
      min_channel_effective_sell_price: '',
      name: '腾讯视频周卡商品',
      primary_channel_name: '',
      product_template_id: 7,
      product_template_title: '腾讯模板',
      purchase_limit_strategy_id: 8,
      purchase_limit_strategy_name: '启用策略',
      status: 1,
      supply_type: 'channel',
      terminal_price_limit: '29.9000',
    },
    {
      brand_id: 3,
      brand_icon: '/uploads/brands/tencent.png',
      brand_name: '腾讯视频周卡',
      bound_channel_count: 1,
      bound_channels: ['渠道未税账号'],
      channel_auto_price_status: 0,
      created_at: '2026-04-14 20:10:00',
      default_sell_price: '18.8000',
      exception_notify: 0,
      goods_code: 'GD0000000002',
      goods_type: 'card_secret',
      has_tax: 0,
      id: 2,
      is_douyin: 0,
      is_export: 0,
      min_channel_cost: '10.0000',
      min_channel_effective_sell_price: '18.8000',
      name: '腾讯视频周卡商品-单渠道',
      primary_channel_name: '渠道未税账号',
      product_template_id: 7,
      product_template_title: '腾讯模板',
      purchase_limit_strategy_id: 8,
      purchase_limit_strategy_name: '启用策略',
      status: 1,
      supply_type: 'channel',
      terminal_price_limit: '28.8000',
    },
    {
      brand_id: 3,
      brand_icon: '/uploads/brands/tencent.png',
      brand_name: '腾讯视频周卡',
      bound_channel_count: 3,
      bound_channels: ['渠道含税账号', '渠道未税账号', '渠道备用账号'],
      channel_auto_price_status: 1,
      created_at: '2026-04-14 20:20:00',
      default_sell_price: '20.5000',
      exception_notify: 1,
      goods_code: 'GD0000000003',
      goods_type: 'direct_recharge',
      has_tax: 1,
      id: 3,
      is_douyin: 1,
      is_export: 1,
      min_channel_cost: '9.6200',
      min_channel_effective_sell_price: '10.9200',
      name: '腾讯视频周卡商品-多渠道',
      primary_channel_name: '渠道含税账号',
      product_template_id: 7,
      product_template_title: '腾讯模板',
      purchase_limit_strategy_id: 8,
      purchase_limit_strategy_name: '启用策略',
      status: 1,
      supply_type: 'channel',
      terminal_price_limit: '30.8000',
    },
  ],
}));

const apiMocks = vi.hoisted(() => ({
  addProductGoodsApi: vi.fn(),
  deleteProductGoodsApi: vi.fn(),
  getProductGoodsDetailApi: vi.fn(),
  getProductGoodsFormOptionsApi: vi.fn(),
  getProductGoodsListApi: vi.fn(),
  getSubjectsApi: vi.fn(),
  updateProductGoodsStatusApi: vi.fn(),
  updateProductGoodsApi: vi.fn(),
}));

const formUpdateSchemaMock = vi.hoisted(() => vi.fn());
const gridReloadMock = vi.hoisted(() => vi.fn());
const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
}));
const channelDialogState = vi.hoisted(() => ({
  lastProps: null as any,
}));
const elementState = vi.hoisted(() => ({
  cascaderOptions: null as any,
  formItems: [] as Array<{ prop?: string; required?: boolean; rules?: any }>,
}));
const testState = vi.hoisted(() => ({
  accessCodes: ['product.goods'],
}));

vi.mock('#/api/modules/admin/products/goods', () => apiMocks);
vi.mock('#/api/modules/admin/subjects', () => apiMocks);
vi.mock('./components/channel-config/GoodsChannelDialog.vue', () => ({
  default: defineComponent({
    name: 'GoodsChannelDialogStub',
    props: {
      goodsId: {
        default: null,
        type: Number,
      },
      visible: Boolean,
    },
    emits: ['saved', 'update:visible'],
    setup(props, { emit }) {
      channelDialogState.lastProps = props;
      return () =>
        props.visible
          ? h('section', { 'data-test': 'goods-channel-dialog' }, [
              h(
                'div',
                { 'data-test': 'goods-channel-dialog-id' },
                String(props.goodsId),
              ),
              h(
                'button',
                {
                  'data-test': 'goods-channel-dialog-save',
                  onClick: () => emit('saved'),
                },
                'save-channel-dialog',
              ),
              h(
                'button',
                {
                  'data-test': 'goods-channel-dialog-close',
                  onClick: () => emit('update:visible', false),
                },
                'close-channel-dialog',
              ),
            ])
          : null;
    },
  }),
}));

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('div', { 'data-test': 'page' }, slots.default?.());
    },
  }),
}));

vi.mock('@vben/hooks', () => ({
  useAppConfig: () => ({
    apiURL: 'http://127.0.0.1:8080/api',
  }),
}));

vi.mock('@vben/stores', () => ({
  useAccessStore: () => ({
    accessCodes: testState.accessCodes,
  }),
}));

vi.mock('#/adapter/vxe-table', () => ({
  useVbenVxeGrid: (config: any) => {
    gridConfigState.latest = config;
    const Grid = defineComponent({
      name: 'GridStub',
      setup(_, { slots }) {
        return () =>
          h('div', { 'data-test': 'grid' }, [
            slots['toolbar-actions']?.(),
            ...fixtures.rows.map((row) =>
              h('div', { 'data-row-id': String(row.id) }, [
                h('div', { 'data-cell': 'product-info' }, [
                  slots.productInfo?.({ row }),
                ]),
                h('div', { 'data-cell': 'channel-config' }, [
                  slots.channelConfig?.({ row }),
                ]),
                h('div', { 'data-cell': 'status' }, [slots.status?.({ row })]),
                h('div', { 'data-cell': 'actions' }, [
                  slots.actions?.({ row }),
                ]),
              ]),
            ),
          ]);
      },
    });

    return [
      Grid,
      {
        formApi: {
          updateSchema: formUpdateSchemaMock,
        },
        grid: {},
        reload: gridReloadMock,
      },
    ];
  },
}));

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
    props: {
      modelValue: Boolean,
      title: {
        default: '',
        type: String,
      },
    },
    emits: ['update:modelValue'],
    setup(props, { emit, slots }) {
      return () =>
        props.modelValue
          ? h('section', { 'data-test': 'dialog' }, [
              h('h2', props.title),
              slots.default?.(),
              slots.footer?.(),
              h(
                'button',
                {
                  'data-test': 'dialog-close',
                  onClick: () => emit('update:modelValue', false),
                },
                'close',
              ),
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
      required: {
        default: false,
        type: Boolean,
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

  const ElImage = defineComponent({
    name: 'ElImageStub',
    props: {
      src: {
        default: '',
        type: String,
      },
    },
    setup(props, { attrs, slots }) {
      return () =>
        props.src
          ? h('img', {
              ...attrs,
              src: props.src,
            })
          : h('div', attrs, slots.error?.());
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
    props: {
      disabled: Boolean,
      label: {
        default: '',
        type: String,
      },
      value: {
        default: '',
        type: [Number, String],
      },
    },
    setup(props) {
      return () =>
        h(
          'div',
          {
            'data-disabled': String(props.disabled),
            'data-test': 'select-option',
            'data-value': String(props.value),
          },
          props.label,
        );
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
        h('div', { ...attrs, 'data-test': 'select' }, [
          h('input', {
            'data-test': attrs['data-test'],
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
          h('div', { 'data-test': 'select-value' }, String(props.modelValue)),
          slots.default?.(),
        ]);
    },
  });

  const ElSwitch = defineComponent({
    name: 'ElSwitchStub',
    props: {
      activeValue: {
        default: 1,
        type: [Number, String],
      },
      inactiveValue: {
        default: 0,
        type: [Number, String],
      },
      modelValue: {
        default: 0,
        type: [Number, String],
      },
    },
    emits: ['change', 'update:modelValue'],
    setup(props, { attrs, emit }) {
      return () =>
        h(
          'button',
          {
            ...attrs,
            onClick: () => {
              const nextValue =
                props.modelValue === props.activeValue
                  ? props.inactiveValue
                  : props.activeValue;
              emit('update:modelValue', nextValue);
              emit('change', nextValue);
            },
          },
          props.modelValue === props.activeValue ? '启用' : '停用',
        );
    },
  });

  const ElCascader = defineComponent({
    name: 'ElCascaderStub',
    props: {
      modelValue: {
        default: () => [],
        type: Array,
      },
      options: {
        default: () => [],
        type: Array,
      },
    },
    emits: ['change', 'update:modelValue'],
    setup(props, { attrs, emit }) {
      elementState.cascaderOptions = props.options;
      return () =>
        h('input', {
          ...attrs,
          value: (props.modelValue as number[]).join(','),
          onInput: (event: Event) => {
            const value = (event.target as HTMLInputElement).value
              .split(',')
              .map((item) => Number(item.trim()))
              .filter((item) => Number.isFinite(item) && item > 0);
            emit('update:modelValue', value);
            emit('change', value);
          },
        });
    },
  });

  return {
    ElButton,
    ElCascader,
    ElDialog,
    ElForm,
    ElFormItem,
    ElImage,
    ElInput,
    ElInputNumber,
    ElMessage: {
      error: vi.fn(),
      success: vi.fn(),
      warning: vi.fn(),
    },
    ElMessageBox: {
      confirm: vi.fn().mockResolvedValue(undefined),
    },
    ElOption,
    ElSelect,
    ElSwitch,
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);

  const app = createApp(GoodsPage);
  app.config.errorHandler = () => {};
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

function findButton(root: HTMLElement, label: string) {
  const button = [...root.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button, `未找到 ${label} 按钮`).toBeTruthy();
  return button as HTMLButtonElement;
}

function findRowButton(root: HTMLElement, rowId: number, label: string) {
  const row = root.querySelector(`[data-row-id="${rowId}"]`);
  expect(row).toBeTruthy();
  if (!row) {
    throw new Error(`missing row ${rowId}`);
  }
  const button = [...row.querySelectorAll('button')].find(
    (candidate) => candidate.textContent?.trim() === label,
  );
  expect(button, `未找到 ${label} 按钮`).toBeTruthy();
  return button as HTMLButtonElement;
}

function findRowCell(root: HTMLElement, rowId: number, cell: string) {
  const row = root.querySelector(`[data-row-id="${rowId}"]`);
  expect(row).toBeTruthy();
  const target = row?.querySelector(`[data-cell="${cell}"]`);
  expect(target, `未找到 ${cell} 单元格`).toBeTruthy();
  return target as HTMLElement;
}

function findInput(root: HTMLElement, selector: string) {
  const input = root.querySelector(selector);
  expect(input).toBeTruthy();
  return input as HTMLInputElement;
}

describe('product goods page', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    elementState.cascaderOptions = null;
    elementState.formItems = [];
    formUpdateSchemaMock.mockReset();
    gridConfigState.latest = null;
    channelDialogState.lastProps = null;
    gridReloadMock.mockReset();
    testState.accessCodes.splice(
      0,
      testState.accessCodes.length,
      'product.goods',
    );
    apiMocks.getProductGoodsFormOptionsApi.mockResolvedValue(
      fixtures.formOptions,
    );
    apiMocks.getProductGoodsListApi.mockResolvedValue({
      list: fixtures.rows,
      pagination: { page: 1, page_size: 20, total: fixtures.rows.length },
    });
    apiMocks.getSubjectsApi.mockResolvedValue({
      list: fixtures.subjects,
    });
    apiMocks.getProductGoodsDetailApi.mockResolvedValue(fixtures.detail);
    apiMocks.addProductGoodsApi.mockResolvedValue({
      goods_code: 'GD0000000002',
      id: 2,
    });
    apiMocks.updateProductGoodsApi.mockResolvedValue(undefined);
    apiMocks.updateProductGoodsStatusApi.mockResolvedValue({
      failed: [],
      failed_count: 0,
      success_count: 1,
      success_ids: [1],
    });
    apiMocks.deleteProductGoodsApi.mockResolvedValue(undefined);
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('queries with normalized goods filters', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(gridConfigState.latest).toBeTruthy();
    await gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
      {
        page: {
          currentPage: 3,
          pageSize: 50,
        },
      },
      {
        brand_id: ' 3 ',
        goods_type: ' card_secret ',
        has_tax: ' 1 ',
        keyword: ' 腾讯 ',
        status: ' 0 ',
      },
    );

    expect(apiMocks.getProductGoodsListApi).toHaveBeenCalledWith({
      brand_id: 3,
      goods_type: 'card_secret',
      has_tax: '1',
      keyword: '腾讯',
      page: 3,
      page_size: 50,
      status: '0',
    });
  });

  it('does not preload product form options on page entry', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductGoodsFormOptionsApi).not.toHaveBeenCalled();
    expect(view.root.textContent).toContain('卡密');
    expect(view.root.textContent).not.toContain('card_secret');
    const image = view.root.querySelector(
      '[data-test="goods-brand-image-1"]',
    ) as HTMLImageElement | null;
    expect(image?.getAttribute('src')).toBe(
      'http://127.0.0.1:8080/uploads/brands/tencent.png',
    );
    expect(view.root.textContent).toContain('含税');
  });

  it('toggles goods status from the list', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '启用').click();
    await flushPromises();

    expect(apiMocks.updateProductGoodsStatusApi).toHaveBeenCalledWith([1], 0);
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('prefers the failed reason when status update reports failures', async () => {
    const { ElMessage } = await import('element-plus');
    apiMocks.updateProductGoodsStatusApi.mockResolvedValueOnce({
      failed: [{ id: 1, reason: '商品不存在' }],
      failed_count: 1,
      success_count: 0,
      success_ids: [],
    });
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '启用').click();
    await flushPromises();

    expect(ElMessage.error).toHaveBeenCalledWith('商品不存在');
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('disables overflow clipping for the product info column so row height can grow', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const productInfoColumn = gridConfigState.latest.gridOptions.columns.find(
      (column: { field?: string }) => column.field === 'product_info',
    );
    expect(productInfoColumn?.showOverflow).toBe(false);
    expect(gridConfigState.latest.gridClass).toContain('myjob-goods-grid');
  });

  it('keeps type and template inside product info and gives that column more width', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const columns = gridConfigState.latest.gridOptions.columns as Array<{
      field?: string;
      minWidth?: number;
    }>;
    const productInfoColumn = columns.find(
      (column) => column.field === 'product_info',
    );

    expect(productInfoColumn?.minWidth).toBe(560);
    expect(columns.some((column) => column.field === 'goods_type')).toBe(false);
    expect(
      columns.some((column) => column.field === 'product_template_title'),
    ).toBe(false);
  });

  it('renders the channel config summary for unbound, single-channel, and auto-priced rows', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(findRowCell(view.root, 1, 'channel-config').textContent).toContain(
      '未绑定',
    );

    const singleChannelCell = findRowCell(view.root, 2, 'channel-config');
    expect(singleChannelCell.textContent).toContain('渠道未税账号');
    expect(singleChannelCell.textContent).toContain('最低进价');
    expect(singleChannelCell.textContent).toContain('10.0000');

    const multiChannelCell = findRowCell(view.root, 3, 'channel-config');
    expect(multiChannelCell.textContent).toContain('渠道含税账号');
    expect(multiChannelCell.textContent).toContain('+2');
    expect(multiChannelCell.textContent).toContain('自动改价');
    expect(multiChannelCell.textContent).toContain('9.6200');
  });

  it('opens the goods channel dialog from the channel config column and reloads after save', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    const trigger = findRowCell(view.root, 3, 'channel-config').querySelector(
      'button',
    );
    expect(trigger).toBeTruthy();
    (trigger as HTMLButtonElement).click();
    await flushPromises();
    await nextTick();

    expect(
      view.root.querySelector('[data-test="goods-channel-dialog"]'),
    ).toBeTruthy();
    expect(
      view.root.querySelector('[data-test="goods-channel-dialog-id"]')
        ?.textContent,
    ).toBe('3');

    (
      view.root.querySelector(
        '[data-test="goods-channel-dialog-save"]',
      ) as HTMLButtonElement
    ).click();
    await flushPromises();

    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('creates a product with the leaf brand path and channel defaults', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductGoodsFormOptionsApi).toHaveBeenCalledTimes(1);

    const brandInput = findInput(
      view.root,
      'input[data-test="goods-brand-path"]',
    );
    brandInput.value = '1,2,3';
    brandInput.dispatchEvent(new Event('input'));

    const nameInput = findInput(view.root, 'input[data-test="goods-name"]');
    nameInput.value = '腾讯视频新周卡';
    nameInput.dispatchEvent(new Event('input'));

    const sellPriceInput = findInput(
      view.root,
      'input[data-test="goods-default-sell-price"]',
    );
    sellPriceInput.value = '19.9000';
    sellPriceInput.dispatchEvent(new Event('input'));

    const terminalPriceInput = findInput(
      view.root,
      'input[data-test="goods-terminal-price-limit"]',
    );
    terminalPriceInput.value = '29.9000';
    terminalPriceInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addProductGoodsApi).toHaveBeenCalledWith({
      balance_limit: '0.0000',
      brand_id: 3,
      default_sell_price: '19.9000',
      exception_notify: 1,
      goods_type: 'card_secret',
      has_tax: 0,
      is_douyin: 0,
      is_export: 1,
      max_purchase_qty: 1,
      min_purchase_qty: 1,
      name: '腾讯视频新周卡',
      product_template_id: null,
      purchase_limit_strategy_id: null,
      purchase_notice: '',
      status: 1,
      subject_id: null,
      supply_type: 'channel',
      terminal_price_limit: '29.9000',
    });
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('loads detail before editing and keeps the disabled bound strategy visible', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findRowButton(view.root, 1, '编辑').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.getProductGoodsDetailApi).toHaveBeenCalledWith(1);
    expect(view.root.textContent).toContain('旧策略（当前已绑定/已禁用）');

    const nameInput = findInput(view.root, 'input[data-test="goods-name"]');
    nameInput.value = '腾讯视频周卡商品-改';
    nameInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.updateProductGoodsApi).toHaveBeenCalledWith(1, {
      balance_limit: '0.0000',
      brand_id: 3,
      default_sell_price: '19.9000',
      exception_notify: 1,
      goods_type: 'card_secret',
      has_tax: 1,
      is_douyin: 0,
      is_export: 1,
      max_purchase_qty: 5,
      min_purchase_qty: 1,
      name: '腾讯视频周卡商品-改',
      product_template_id: 7,
      purchase_limit_strategy_id: 9,
      purchase_notice: '购买须知',
      status: 1,
      subject_id: 11,
      supply_type: 'channel',
      terminal_price_limit: '29.9000',
    });
  });

  it('deletes a product from the row actions', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findRowButton(view.root, 1, '删除').click();
    await flushPromises();

    expect(apiMocks.deleteProductGoodsApi).toHaveBeenCalledWith(1);
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('hides management actions without product.goods permission', async () => {
    testState.accessCodes.splice(0);
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(view.root.textContent).not.toContain('新增商品');
    expect(view.root.textContent).not.toContain('编辑');
    expect(view.root.textContent).not.toContain('删除');
  });

  it('keeps non-leaf brand nodes expandable in the cascader options', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    expect(elementState.cascaderOptions).toEqual([
      {
        children: [
          {
            children: [
              {
                children: [],
                disabled: false,
                label: '周卡',
                value: 3,
              },
            ],
            disabled: false,
            label: 'SVIP',
            value: 2,
          },
        ],
        disabled: false,
        label: '腾讯视频',
        value: 1,
      },
    ]);
  });

  it('does not submit create when required fields are empty', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    const brandInput = findInput(
      view.root,
      'input[data-test="goods-brand-path"]',
    );
    brandInput.value = '1,2,3';
    brandInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addProductGoodsApi).not.toHaveBeenCalled();
  });

  it('does not submit create when purchase quantity range is invalid', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    const brandInput = findInput(
      view.root,
      'input[data-test="goods-brand-path"]',
    );
    brandInput.value = '1,2,3';
    brandInput.dispatchEvent(new Event('input'));

    const nameInput = findInput(view.root, 'input[data-test="goods-name"]');
    nameInput.value = '腾讯视频新周卡';
    nameInput.dispatchEvent(new Event('input'));

    const minQtyInput = findInput(
      view.root,
      'input[data-test="goods-min-purchase-qty"]',
    );
    minQtyInput.value = '5';
    minQtyInput.dispatchEvent(new Event('input'));

    const maxQtyInput = findInput(
      view.root,
      'input[data-test="goods-max-purchase-qty"]',
    );
    maxQtyInput.value = '3';
    maxQtyInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addProductGoodsApi).not.toHaveBeenCalled();
  });

  it('does not submit create when money format is invalid', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    const brandInput = findInput(
      view.root,
      'input[data-test="goods-brand-path"]',
    );
    brandInput.value = '1,2,3';
    brandInput.dispatchEvent(new Event('input'));

    const nameInput = findInput(view.root, 'input[data-test="goods-name"]');
    nameInput.value = '腾讯视频新周卡';
    nameInput.dispatchEvent(new Event('input'));

    const sellPriceInput = findInput(
      view.root,
      'input[data-test="goods-default-sell-price"]',
    );
    sellPriceInput.value = 'abc';
    sellPriceInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addProductGoodsApi).not.toHaveBeenCalled();
  });

  it('requires a subject when tax is enabled', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    const brandInput = findInput(
      view.root,
      'input[data-test="goods-brand-path"]',
    );
    brandInput.value = '1,2,3';
    brandInput.dispatchEvent(new Event('input'));

    const nameInput = findInput(view.root, 'input[data-test="goods-name"]');
    nameInput.value = '腾讯视频含税周卡';
    nameInput.dispatchEvent(new Event('input'));

    const hasTaxInput = findInput(
      view.root,
      'input[data-test="goods-has-tax"]',
    );
    hasTaxInput.value = '1';
    hasTaxInput.dispatchEvent(new Event('input'));
    await nextTick();

    expect(view.root.textContent).toContain('主体');

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addProductGoodsApi).not.toHaveBeenCalled();
  });

  it('keeps the subject select empty before the user chooses one', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    const hasTaxInput = findInput(
      view.root,
      'input[data-test="goods-has-tax"]',
    );
    hasTaxInput.value = '1';
    hasTaxInput.dispatchEvent(new Event('input'));
    await nextTick();

    const subjectInput = findInput(
      view.root,
      'input[data-test="goods-subject-id"]',
    );
    expect(subjectInput.value).toBe('');
  });

  it('loads subjects from /admin/subjects only when the dialog opens', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(apiMocks.getSubjectsApi).not.toHaveBeenCalled();

    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.getSubjectsApi).toHaveBeenCalledTimes(1);

    const hasTaxInput = findInput(
      view.root,
      'input[data-test="goods-has-tax"]',
    );
    hasTaxInput.value = '1';
    hasTaxInput.dispatchEvent(new Event('input'));
    await nextTick();

    expect(view.root.textContent).toContain('开票主体A');
    expect(view.root.textContent).not.toContain('聚合接口旧主体');
    expect(view.root.textContent).not.toContain('未税主体B');
  });

  it('does not render future placeholder filters or tabs', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(view.root.textContent).not.toContain('已断货商品');
    expect(view.root.textContent).not.toContain('修改配置');
    expect(view.root.textContent).not.toContain('批量开启对接状态');
  });

  it('marks the goods name field as required for the form label indicator', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增商品').click();
    await flushPromises();
    await nextTick();

    const nameItem = elementState.formItems.find(
      (item) => item.prop === 'name',
    );
    expect(nameItem).toBeTruthy();
    expect(nameItem?.required).toBe(true);
  });
});
