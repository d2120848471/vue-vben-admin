/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import PurchaseLimitsPage from './index.vue';

const fixtures = vi.hoisted(() => ({
  enums: {
    limit_types: [
      { id: 1, title: '同一会员' },
      { id: 2, title: '同一充值账号' },
    ],
    period_types: [
      { id: 1, title: '按天' },
      { id: 2, title: '按区间(分钟)' },
    ],
  },
  rows: [
    {
      created_at: '2026-01-15 18:25:34',
      id: 1,
      limit_nums: 2,
      limit_times: 2,
      limit_type: 2,
      limit_type_label: '同一充值账号',
      name: '一天一号两次',
      period: 1,
      period_type: 1,
      period_type_label: '按天',
      status: 1,
    },
    {
      created_at: '2026-01-13 16:51:19',
      id: 2,
      limit_nums: 0,
      limit_times: 5,
      limit_type: 2,
      limit_type_label: '同一充值账号',
      name: '防循环',
      period: 3,
      period_type: 2,
      period_type_label: '按区间(分钟)',
      status: 0,
    },
  ],
}));

const apiMocks = vi.hoisted(() => ({
  addPurchaseLimitStrategyApi: vi.fn(),
  deletePurchaseLimitStrategyApi: vi.fn(),
  getPurchaseLimitStrategyEnumsApi: vi.fn(),
  getPurchaseLimitStrategyListApi: vi.fn(),
  updatePurchaseLimitStrategyApi: vi.fn(),
  updatePurchaseLimitStrategyStatusApi: vi.fn(),
}));

const gridReloadMock = vi.hoisted(() => vi.fn());
const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
}));
const testState = vi.hoisted(() => ({
  accessCodes: ['product.purchase_limit'],
}));

vi.mock('#/api', () => apiMocks);

vi.mock('@vben/common-ui', () => ({
  Page: defineComponent({
    name: 'PageStub',
    setup(_, { slots }) {
      return () => h('div', { 'data-test': 'page' }, slots.default?.());
    },
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
                h('div', { 'data-cell': 'status' }, [slots.status?.({ row })]),
                h('div', { 'data-cell': 'actions' }, [slots.actions?.({ row })]),
              ]),
            ),
          ]);
      },
    });

    return [
      Grid,
      {
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
    setup(_, { expose, slots }) {
      expose({
        validate: vi.fn().mockResolvedValue(true),
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
    setup(props, { attrs, slots }) {
      return () =>
        h('div', { ...attrs, 'data-test': 'select' }, [
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
          props.modelValue === props.activeValue ? '启用' : '禁用',
        );
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

  const app = createApp(PurchaseLimitsPage);
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

function findInput(root: HTMLElement, selector: string) {
  const input = root.querySelector(selector);
  expect(input).toBeTruthy();
  return input as HTMLInputElement;
}

describe('purchase limit strategies page', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridReloadMock.mockReset();
    gridConfigState.latest = null;
    testState.accessCodes.splice(
      0,
      testState.accessCodes.length,
      'product.purchase_limit',
    );
    apiMocks.getPurchaseLimitStrategyListApi.mockResolvedValue({
      list: fixtures.rows,
      pagination: { page: 1, page_size: 20, total: fixtures.rows.length },
    });
    apiMocks.getPurchaseLimitStrategyEnumsApi.mockResolvedValue(fixtures.enums);
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('loads enums when opening the create dialog', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '新增策略').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.getPurchaseLimitStrategyEnumsApi).toHaveBeenCalledTimes(1);
    expect(view.root.textContent).toContain('同一会员');
    expect(view.root.textContent).toContain('按区间(分钟)');
  });

  it('creates a strategy and keeps zero values in the payload', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '新增策略').click();
    await flushPromises();
    await nextTick();

    const nameInput = findInput(view.root, 'input[data-test="strategy-name"]');
    nameInput.value = '新用户';
    nameInput.dispatchEvent(new Event('input'));

    const periodInput = findInput(view.root, 'input[data-test="strategy-period"]');
    periodInput.value = '30';
    periodInput.dispatchEvent(new Event('input'));

    const limitNumsInput = findInput(
      view.root,
      'input[data-test="strategy-limit-nums"]',
    );
    limitNumsInput.value = '0';
    limitNumsInput.dispatchEvent(new Event('input'));

    const limitTimesInput = findInput(
      view.root,
      'input[data-test="strategy-limit-times"]',
    );
    limitTimesInput.value = '1';
    limitTimesInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addPurchaseLimitStrategyApi).toHaveBeenCalledWith({
      limit_nums: 0,
      limit_times: 1,
      limit_type: 1,
      name: '新用户',
      period: 30,
      period_type: 1,
    });
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('updates an existing strategy from the row payload without status', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '编辑').click();
    await flushPromises();
    await nextTick();

    const nameInput = findInput(view.root, 'input[data-test="strategy-name"]');
    nameInput.value = '一天一号三次';
    nameInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.updatePurchaseLimitStrategyApi).toHaveBeenCalledWith(1, {
      limit_nums: 2,
      limit_times: 2,
      limit_type: 2,
      name: '一天一号三次',
      period: 1,
      period_type: 1,
    });
  });

  it('deletes a strategy from the row actions', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 2, '删除').click();
    await flushPromises();

    expect(apiMocks.deletePurchaseLimitStrategyApi).toHaveBeenCalledWith(2);
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('toggles strategy status from the list', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '启用').click();
    await flushPromises();

    expect(apiMocks.updatePurchaseLimitStrategyStatusApi).toHaveBeenCalledWith(
      1,
      0,
    );
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('keeps the create dialog closed when enum loading fails', async () => {
    const { ElMessage } = await import('element-plus');
    apiMocks.getPurchaseLimitStrategyEnumsApi.mockRejectedValueOnce(
      new Error('load enums failed'),
    );
    const view = await renderPage();
    mountedRoots.push(view);

    findButton(view.root, '新增策略').click();
    await flushPromises();
    await nextTick();

    expect(ElMessage.error).toHaveBeenCalledWith(
      '限制策略枚举加载失败，请稍后重试',
    );
    expect(view.root.querySelector('[data-test="dialog"]')).toBeNull();
  });

  it('keeps the edit dialog closed when enum loading fails', async () => {
    const { ElMessage } = await import('element-plus');
    apiMocks.getPurchaseLimitStrategyEnumsApi.mockRejectedValueOnce(
      new Error('load enums failed'),
    );
    const view = await renderPage();
    mountedRoots.push(view);

    findRowButton(view.root, 1, '编辑').click();
    await flushPromises();
    await nextTick();

    expect(ElMessage.error).toHaveBeenCalledWith(
      '限制策略枚举加载失败，请稍后重试',
    );
    expect(view.root.querySelector('[data-test="dialog"]')).toBeNull();
  });

  it('queries only by keyword', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    expect(gridConfigState.latest).toBeTruthy();
    await gridConfigState.latest.gridOptions.proxyConfig.ajax.query(
      {
        page: {
          currentPage: 2,
          pageSize: 50,
        },
      },
      {
        keyword: '  一天一号 ',
        status: '1',
      },
    );

    expect(apiMocks.getPurchaseLimitStrategyListApi).toHaveBeenCalledWith({
      keyword: '一天一号',
      page: 2,
      page_size: 50,
    });
  });

  it('hides management actions without product.purchase_limit permission', async () => {
    testState.accessCodes.splice(0);
    const view = await renderPage();
    mountedRoots.push(view);

    expect(view.root.textContent).not.toContain('新增策略');
    expect(view.root.textContent).not.toContain('编辑');
    expect(view.root.textContent).not.toContain('删除');
    expect(view.root.textContent).not.toContain('启用');
    expect(view.root.textContent).not.toContain('禁用');
  });
});
