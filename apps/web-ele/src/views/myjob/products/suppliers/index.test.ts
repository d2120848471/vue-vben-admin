/* eslint-disable vue/one-component-per-file */

import { createApp, defineComponent, h, nextTick } from 'vue';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SuppliersPage from './index.vue';

const fixtures = vi.hoisted(() => ({
  rows: [
    {
      backup_domain: 'backup.xqy.test',
      balance_warning: 0,
      connect_status: 0,
      connect_status_text: '未验证',
      crowd_name: '运营群',
      domain: 'api.xqy.test',
      has_tax: 1,
      id: 1,
      last_balance: '',
      last_balance_at: '',
      last_balance_message: '',
      name: '木木（星权益含税）',
      provider_code: 'xingquanyi',
      provider_name: '星权益',
      sort: 5,
      subject_id: 7,
      subject_name: '聚权益',
      threshold_amount: '5000.0000',
      type_id: 35,
      type_name: '星权益',
    },
    {
      backup_domain: 'backup.youka.test',
      balance_warning: 1,
      connect_status: 1,
      connect_status_text: '正常',
      crowd_name: '售后群',
      domain: 'api.youka.test',
      has_tax: 0,
      id: 2,
      last_balance: '1888.0000',
      last_balance_at: '2026-04-14 18:12:00',
      last_balance_message: '查询成功',
      name: '优卡云（未税）',
      provider_code: 'youkayun',
      provider_name: '同系统',
      sort: 2,
      subject_id: 8,
      subject_name: '优权益',
      threshold_amount: '3000.0000',
      type_id: 7,
      type_name: '同系统',
    },
  ],
  subjects: [
    {
      created_at: '',
      has_tax: 1,
      id: 7,
      name: '聚权益',
      updated_at: '',
    },
    {
      created_at: '',
      has_tax: 0,
      id: 8,
      name: '优权益',
      updated_at: '',
    },
  ],
  types: [
    { id: 35, provider_code: 'xingquanyi', type_name: '星权益' },
    { id: 7, provider_code: 'youkayun', type_name: '同系统' },
  ],
}));

const apiMocks = vi.hoisted(() => ({
  addSupplierPlatformApi: vi.fn(),
  deleteSupplierPlatformApi: vi.fn(),
  getSubjectsApi: vi.fn(),
  getSupplierPlatformDetailApi: vi.fn(),
  getSupplierPlatformListApi: vi.fn(),
  getSupplierPlatformTypesApi: vi.fn(),
  refreshSupplierPlatformBalanceApi: vi.fn(),
  updateSupplierPlatformApi: vi.fn(),
}));

const gridReloadMock = vi.hoisted(() => vi.fn());
const gridConfigState = vi.hoisted(() => ({
  latest: null as any,
}));
const testState = vi.hoisted(() => ({
  accessCodes: ['supplier.index'],
}));

vi.mock('#/api/modules/admin/products/suppliers', () => apiMocks);
vi.mock('#/api/modules/admin/subjects', () => apiMocks);

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
                h('div', { 'data-cell': 'balance' }, row.last_balance || '--'),
                h(
                  'div',
                  { 'data-cell': 'connect_status' },
                  row.connect_status_text,
                ),
                h(
                  'div',
                  { 'data-cell': 'last_message' },
                  row.last_balance_message || '--',
                ),
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
  };
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

async function renderPage() {
  const root = document.createElement('div');
  document.body.append(root);

  const app = createApp(SuppliersPage);
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

describe('supplier platforms page', () => {
  const mountedRoots: Array<{ unmount: () => void }> = [];

  beforeEach(() => {
    vi.clearAllMocks();
    gridReloadMock.mockReset();
    gridConfigState.latest = null;
    testState.accessCodes.splice(
      0,
      testState.accessCodes.length,
      'supplier.index',
    );
    const [firstRow, secondRow] = fixtures.rows;
    if (!(firstRow && secondRow)) {
      throw new Error('供应商测试夹具缺少基础数据');
    }
    Object.assign(firstRow, {
      backup_domain: 'backup.xqy.test',
      balance_warning: 0,
      connect_status: 0,
      connect_status_text: '未验证',
      crowd_name: '运营群',
      domain: 'api.xqy.test',
      has_tax: 1,
      last_balance: '',
      last_balance_at: '',
      last_balance_message: '',
      name: '木木（星权益含税）',
      sort: 5,
      subject_id: 7,
      subject_name: '聚权益',
      threshold_amount: '5000.0000',
      type_id: 35,
      type_name: '星权益',
    });
    Object.assign(secondRow, {
      backup_domain: 'backup.youka.test',
      balance_warning: 1,
      connect_status: 1,
      connect_status_text: '正常',
      crowd_name: '售后群',
      domain: 'api.youka.test',
      has_tax: 0,
      last_balance: '1888.0000',
      last_balance_at: '2026-04-14 18:12:00',
      last_balance_message: '查询成功',
      name: '优卡云（未税）',
      sort: 2,
      subject_id: 8,
      subject_name: '优权益',
      threshold_amount: '3000.0000',
      type_id: 7,
      type_name: '同系统',
    });
    apiMocks.getSupplierPlatformListApi.mockResolvedValue({
      list: fixtures.rows,
      pagination: { page: 1, page_size: 20, total: fixtures.rows.length },
    });
    apiMocks.getSupplierPlatformTypesApi.mockResolvedValue({
      list: fixtures.types,
    });
    apiMocks.getSubjectsApi.mockResolvedValue({
      list: fixtures.subjects,
    });
    apiMocks.getSupplierPlatformDetailApi.mockResolvedValue({
      backup_domain: 'backup.xqy.test',
      crowd_name: '运营群',
      domain: 'api.xqy.test',
      extra_config: {},
      has_tax: 1,
      id: 1,
      name: '木木（星权益含税）',
      provider_code: 'xingquanyi',
      provider_name: '星权益',
      secret_key: 'secret-key',
      sort: 5,
      subject_id: 7,
      threshold_amount: '5000.0000',
      token_id: '1008612345',
      type_id: 35,
    });
  });

  afterEach(() => {
    while (mountedRoots.length > 0) {
      mountedRoots.pop()?.unmount();
    }
  });

  it('loads platform types and subjects for the create dialog', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增平台').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.getSupplierPlatformTypesApi).toHaveBeenCalledTimes(1);
    expect(apiMocks.getSubjectsApi).toHaveBeenCalledTimes(1);
    expect(view.root.textContent).toContain('星权益');
    expect(view.root.textContent).toContain('聚权益');
  });

  it('creates a supplier platform with trimmed payload values', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findButton(view.root, '新增平台').click();
    await flushPromises();
    await nextTick();

    findInput(view.root, 'input[data-test="supplier-name"]').value =
      ' 木木（星权益含税） ';
    findInput(view.root, 'input[data-test="supplier-name"]').dispatchEvent(
      new Event('input'),
    );
    findInput(view.root, 'input[data-test="supplier-domain"]').value =
      ' api.xqy.test ';
    findInput(view.root, 'input[data-test="supplier-domain"]').dispatchEvent(
      new Event('input'),
    );
    findInput(view.root, 'input[data-test="supplier-backup-domain"]').value =
      ' backup.xqy.test ';
    findInput(
      view.root,
      'input[data-test="supplier-backup-domain"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="supplier-token-id"]').value =
      ' 1008612345 ';
    findInput(view.root, 'input[data-test="supplier-token-id"]').dispatchEvent(
      new Event('input'),
    );
    findInput(view.root, 'input[data-test="supplier-secret-key"]').value =
      ' secret-key ';
    findInput(
      view.root,
      'input[data-test="supplier-secret-key"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="supplier-threshold-amount"]').value =
      ' 5000.0000 ';
    findInput(
      view.root,
      'input[data-test="supplier-threshold-amount"]',
    ).dispatchEvent(new Event('input'));
    findInput(view.root, 'input[data-test="supplier-sort"]').value = '5';
    findInput(view.root, 'input[data-test="supplier-sort"]').dispatchEvent(
      new Event('input'),
    );
    findInput(view.root, 'input[data-test="supplier-crowd-name"]').value =
      ' 运营群 ';
    findInput(
      view.root,
      'input[data-test="supplier-crowd-name"]',
    ).dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.addSupplierPlatformApi).toHaveBeenCalledWith({
      backup_domain: 'backup.xqy.test',
      crowd_name: '运营群',
      domain: 'api.xqy.test',
      has_tax: 1,
      name: '木木（星权益含税）',
      secret_key: 'secret-key',
      sort: 5,
      subject_id: 7,
      threshold_amount: '5000.0000',
      token_id: '1008612345',
      type_id: 35,
    });
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('loads detail before updating an existing supplier platform', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findRowButton(view.root, 1, '编辑').click();
    await flushPromises();
    await nextTick();

    const nameInput = findInput(view.root, 'input[data-test="supplier-name"]');
    nameInput.value = '木木（星权益未税）';
    nameInput.dispatchEvent(new Event('input'));

    findButton(view.root, '确定').click();
    await flushPromises();

    expect(apiMocks.getSupplierPlatformDetailApi).toHaveBeenCalledWith(1);
    expect(apiMocks.updateSupplierPlatformApi).toHaveBeenCalledWith(1, {
      backup_domain: 'backup.xqy.test',
      crowd_name: '运营群',
      domain: 'api.xqy.test',
      has_tax: 1,
      name: '木木（星权益未税）',
      secret_key: 'secret-key',
      sort: 5,
      subject_id: 7,
      threshold_amount: '5000.0000',
      token_id: '1008612345',
      type_id: 35,
    });
  });

  it('refreshes balance in place for a row and keeps the page open', async () => {
    const { ElMessage } = await import('element-plus');
    apiMocks.refreshSupplierPlatformBalanceApi.mockResolvedValueOnce({
      balance: '24588.5010',
      connect_status: 1,
      connect_status_text: '正常',
      id: 1,
      message: '查询成功',
      refreshed_at: '2026-04-14 20:00:00',
      trace_id: 'trace-1',
    });
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findRowButton(view.root, 1, '余额查询').click();
    await flushPromises();
    await nextTick();

    expect(apiMocks.refreshSupplierPlatformBalanceApi).toHaveBeenCalledWith(1);
    expect(ElMessage.success).toHaveBeenCalledWith('查询成功');
    expect(gridReloadMock).not.toHaveBeenCalled();
    expect(view.root.textContent).toContain('24588.5010');
    expect(view.root.textContent).toContain('正常');
    expect(view.root.textContent).toContain('查询成功');
  });

  it('applies failed balance messages back onto the row', async () => {
    const { ElMessage } = await import('element-plus');
    apiMocks.refreshSupplierPlatformBalanceApi.mockResolvedValueOnce({
      balance: '1888.0000',
      connect_status: 2,
      connect_status_text: '异常',
      id: 2,
      message: '签名错误',
      refreshed_at: '2026-04-14 20:05:00',
      trace_id: 'trace-2',
    });
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findRowButton(view.root, 2, '余额查询').click();
    await flushPromises();
    await nextTick();

    expect(ElMessage.error).toHaveBeenCalledWith('签名错误');
    expect(view.root.textContent).toContain('异常');
    expect(view.root.textContent).toContain('签名错误');
  });

  it('deletes a supplier platform from the row actions', async () => {
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();
    findRowButton(view.root, 2, '删除').click();
    await flushPromises();

    expect(apiMocks.deleteSupplierPlatformApi).toHaveBeenCalledWith(2);
    expect(gridReloadMock).toHaveBeenCalledTimes(1);
  });

  it('queries with normalized supplier filters', async () => {
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
        connect_status: ' 2 ',
        has_tax: ' 1 ',
        keyword: ' 木木 ',
        subject_id: '7',
        type_id: '35',
      },
    );

    expect(apiMocks.getSupplierPlatformListApi).toHaveBeenCalledWith({
      connect_status: '2',
      has_tax: '1',
      keyword: '木木',
      page: 3,
      page_size: 50,
      subject_id: 7,
      type_id: 35,
    });
  });

  it('hides management actions without supplier.index permission', async () => {
    testState.accessCodes.splice(0);
    const view = await renderPage();
    mountedRoots.push(view);

    await flushPromises();
    await nextTick();

    expect(view.root.textContent).not.toContain('新增平台');
    expect(view.root.textContent).not.toContain('编辑');
    expect(view.root.textContent).not.toContain('删除');
    expect(view.root.textContent).not.toContain('余额查询');
  });
});
